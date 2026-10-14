-- Pandoc filter for scripts/build-thesis.js: writes the thesis (one LaTeX document, includes expanded) as the
-- thesis reader's MDX, one page per chapter, into THESIS_OUT. THESIS_SRC is the thesis checkout with its compiled
-- build/, THESIS_CSL the IEEE citation style; runs from the site root. Numbers chapters, sections, figures and
-- tables as LaTeX does and checks them against thesis.aux; links \ref and \cite; formats the bibliography with
-- citeproc in thesis.bbl's citation order. Figures become <Diagram>, tables <Table>, references <Reference>
-- (src/theme/MDXComponents.js). Stops on any LaTeX command it does not handle.
local OUT, SRC, CSL = os.getenv('THESIS_OUT'), os.getenv('THESIS_SRC'), os.getenv('THESIS_CSL')
local WRITER = 'commonmark_x-smart-superscript-subscript-fenced_divs-bracketed_spans-raw_attribute'
local SKIP = { centering = 1, small = 1, footnotesize = 1, setlength = 1, frontmatter = 1, mainmatter = 1,
  backmatter = 1, hfill = 1, arraybackslash = 1, label = 1, addlinespace = 1, endlastfoot = 1 }
local unknown = {}

local function read(path) local f = assert(io.open(path)); local s = f:read('a'); f:close(); return s end
local function write(path, s) local f = assert(io.open(OUT .. '/' .. path, 'w')); f:write(s); f:close() end
local function anchor(label) return (label:gsub(':', '-')) end
-- MDX has no <url> autolinks: write them as [url](url).
local function md(blocks)
  return (pandoc.write(pandoc.Pandoc(blocks), WRITER, { wrap_text = 'wrap-none' }):gsub('<(https?://[^>%s]+)>', '[%1](%1)'):gsub('%s+$', ''))
end
local function inline(blocks) return (md(blocks):gsub('\n', ' ')) end
local function jsx(value) return pandoc.json.encode(value) end

-- 'APM DESIGN' -> 'APM Design'
local function titlecase(s)
  return (s:gsub('%S+', function(w) return w == 'APM' and w or w:sub(1, 1) .. w:sub(2):lower() end))
end

-- thesis.aux: label -> printed number; thesis.bbl: citation key -> number, in citation order.
local aux, cites, keys = {}, {}, {}
for label, number in read(SRC .. '/build/thesis.aux'):gmatch('\\newlabel{([^}]+)}{{([^}]*)}') do aux[label] = number end
for key in read(SRC .. '/build/thesis.bbl'):gmatch('\\entry{([^}]+)}') do keys[#keys + 1] = key; cites[key] = #keys end

-- A threeparttable stays raw LaTeX: parse its table and notes separately; \tnote{a} becomes a superscript.
local function threeparttable(raw)
  local notes = pandoc.List()
  local tex = raw:gsub('\\begin{tablenotes}.-\\end{tablenotes}', function(block)
    for mark, text in block:gsub('\\end{tablenotes}', ''):gsub('\\item%[', '\0'):gmatch('%z(%w+)%]([^%z]*)') do
      notes:insert({ mark = mark, blocks = pandoc.read(text, 'latex+raw_tex').blocks })
    end
    return ''
  end)
  tex = tex:gsub('\\tnote{([^}]+)}', '\\textsuperscript{%1}'):gsub('\\begin{threeparttable}', '\\begin{table}')
    :gsub('\\end{threeparttable}', '\\end{table}')
  local blocks = pandoc.read(tex, 'latex+raw_tex').blocks
  for i, mark in ipairs(notes:map(function(n) return n.mark end)) do
    assert(mark == string.char(96 + i), 'table notes out of order: ' .. mark)
  end
  blocks:insert(pandoc.Div(pandoc.OrderedList(notes:map(function(n) return n.blocks end)), { class = 'notes' }))
  return blocks
end

-- Pages: one per top-level heading; numbered chapters get 1, 2, ... then A, B in the appendix.
local function pages(blocks)
  local list, page, appendix, chapter = {}, nil, false, 0
  for _, b in ipairs(blocks) do
    if b.t == 'RawBlock' and b.text == '\\appendix' then appendix, chapter = true, 0
    elseif b.t == 'Header' and b.level == 1 then
      local title, number = pandoc.utils.stringify(b.content), nil
      if not b.classes:includes('unnumbered') then
        chapter = chapter + 1
        number, title = appendix and string.char(64 + chapter) or tostring(chapter), titlecase(title)
      end
      page = { label = b.identifier, title = title, number = number, appendix = appendix and number ~= nil, blocks = pandoc.Blocks({}) }
      page.slug = title:lower():gsub('[^%w]+', '-')
      list[#list + 1] = page
    elseif page then page.blocks:insert(b) end
  end
  return list
end

function Pandoc(doc)
  local blocks = pandoc.List()
  for _, b in ipairs(doc.blocks) do
    if b.t == 'RawBlock' and b.text:match('^\\begin{threeparttable}') then blocks:extend(threeparttable(b.text))
    else blocks:insert(b) end
  end
  local list = pages(blocks)

  -- Number headings, figures and tables per page, as LaTeX does; record where each label lives.
  local where = {}
  for _, page in ipairs(list) do
    if page.label ~= '' then where[page.label] = { page = page, number = page.number } end
    local section, sub, fig, tab = 0, 0, 0, 0
    local function at(label, number) if label ~= '' then where[label] = { page = page, number = number } end end
    page.blocks = page.blocks:walk({
      traverse = 'topdown',
      Header = function(h)
        if not page.number then return end
        if h.level == 2 then section, sub = section + 1, 0 else sub = sub + 1 end
        local number = page.number .. '.' .. section .. (h.level == 3 and '.' .. sub or '')
        at(h.identifier, number)
        h.identifier = anchor(h.identifier)
        h.content:insert(1, pandoc.Str(number .. ' '))
        return h
      end,
      Figure = function(f) fig = fig + 1; f.attributes.number = page.number .. '.' .. fig; at(f.identifier, f.attributes.number); return f end,
      Table = function(t)
        if t.identifier == '' then return end
        tab = tab + 1; t.attributes.number = page.number .. '.' .. tab; at(t.identifier, t.attributes.number)
        return t
      end,
    })
  end
  for label, number in pairs(aux) do
    local found = where[label]
    if found and found.number ~= number then error(('%s is %s here but %s in the PDF'):format(label, found.number, number)) end
    if not found and not label:match('^fn:') then error('label not found: ' .. label) end
  end

  -- Links from one page to another: the appendices sit in their own folder.
  local function href(from, to, id)
    local file = to.slug .. '.mdx'
    if to.appendix and not from.appendix then file = 'appendices/' .. file
    elseif from.appendix and not to.appendix then file = '../' .. file end
    return file .. (id and '#' .. id or '')
  end
  local bibliography
  for _, page in ipairs(list) do if page.slug == 'bibliography' then bibliography = page end end

  for _, page in ipairs(list) do
    page.blocks = page.blocks:walk({
      Div = function(d) if not d.classes:includes('notes') then return d.content end end,
      Span = function(s) return s.content end,
      Para = function(p) -- display math on its own lines, as remark-math expects
        local out, run = pandoc.Blocks({}), pandoc.Inlines({})
        for _, el in ipairs(p.content) do
          if el.t == 'Math' and el.mathtype == 'DisplayMath' then
            if #run > 0 then out:insert(pandoc.Para(run)); run = pandoc.Inlines({}) end
            out:insert(pandoc.RawBlock('commonmark_x', '$$\n' .. el.text .. '\n$$'))
          else run:insert(el) end
        end
        if #out == 0 then return end
        if #run > 0 then out:insert(pandoc.Para(run)) end
        return out
      end,
      Math = function(m) -- plain numbers and lone variables stay in the page's font; formulas go to KaTeX
        if m.mathtype ~= 'InlineMath' or m.text:match('[\\^_{}]') then return end
        local out = pandoc.Inlines({})
        for text, letters in (m.text:gsub('%-', '−')):gmatch('([^%a]*)(%a*)') do
          if text ~= '' then out:insert(pandoc.Str(text)) end
          if letters ~= '' then out:insert(pandoc.Emph(letters)) end
        end
        return out
      end,
      Str = function(s) -- MDX reads braces as expressions
        if s.text:match('[{}]') then return pandoc.RawInline('commonmark_x', (s.text:gsub('[{}]', '\\%0'))) end
      end,
      RawBlock = function(r) local c = r.text:match('^\\(%a+)'); if not SKIP[c] then unknown[c or r.text] = true end; return {} end,
      RawInline = function(r)
        local command, arg = r.text:match('^\\(%a+)%s*{([^}]*)}')
        command = command or r.text:match('^\\(%a+)')
        if command == 'ref' then
          if arg:match('^fn:') then return pandoc.Str(aux[arg]) end
          local target = assert(where[arg], 'unresolved reference ' .. arg)
          return pandoc.Link(target.number, href(page, target.page, target.page.label ~= arg and anchor(arg) or nil))
        elseif command == 'cite' then
          local links = pandoc.List()
          for key in arg:gmatch('[^,%s]+') do
            local n = assert(cites[key], 'unresolved citation ' .. key)
            if #links > 0 then links:extend({ pandoc.Str(','), pandoc.Space() }) end
            links:insert(pandoc.Link('[' .. n .. ']', href(page, bibliography, 'ref-' .. key)))
          end
          return links
        elseif not SKIP[command] then unknown[command or r.text] = true end
        return {}
      end,
    })
  end
  if next(unknown) then
    local names = {}
    for k in pairs(unknown) do names[#names + 1] = k end
    error('unhandled LaTeX: ' .. table.concat(names, ', '))
  end

  -- Bibliography: citeproc formats every entry, cited in thesis.bbl order, so its numbers match the PDF's.
  local citations = {}
  for i, key in ipairs(keys) do citations[i] = pandoc.Citation(key, 'NormalCitation') end
  local cited = pandoc.Pandoc({ pandoc.Para({ pandoc.Cite({}, citations) }) }, { bibliography = SRC .. '/references.bib', csl = CSL })
  local refs = pandoc.List()
  pandoc.utils.citeproc(cited):walk({
    Div = function(d)
      local key = d.identifier:match('^ref%-(.+)$')
      if key then
        local entry = d:walk({ Span = function(s) if s.classes:includes('csl-left-margin') then return {} end return s.content end })
        refs:insert(('<Reference id=%s number="%d">%s</Reference>'):format(jsx(d.identifier), cites[key], inline(entry.content)))
      end
    end,
  })
  assert(#refs == #keys, ('citeproc formatted %d of %d references'):format(#refs, #keys))
  bibliography.mdx = table.concat(refs, '\n\n')

  -- Figures map to the committed SVGs named after the thesis file, in static/img/diagrams/ or static/img/figures/;
  -- a lone diagram with a -phone layout gets it on phones.
  local function svg(path) local f = io.open('static/img/' .. path .. '-light.svg'); if f then f:close() end; return f end
  local function figure(f)
    local images = pandoc.List()
    f:walk({ Image = function(i)
      local name = i.src:match('([^/]+)%.pdf$')
      local path = svg('diagrams/' .. name) and 'diagrams/' .. name or 'figures/' .. name
      assert(svg(path), 'no website SVG for ' .. i.src)
      images:insert(path)
    end })
    local caption = f.caption.long
    return ('<Diagram id=%s number="%s" images=%s alt=%s%s>%s</Diagram>'):format(jsx(anchor(f.identifier)),
      f.attributes.number, jsx(table.concat(images, ' ')), jsx(pandoc.utils.stringify(caption)),
      #images == 1 and svg(images[1] .. '-phone') and ' phone' or '', inline(caption))
  end

  -- Tables: a Markdown table like the docs', wrapped with its caption and notes. A two-row header (a label spanning
  -- several columns over theirs) becomes one row: "Bucket share Median".
  local function tablemd(t, notes)
    local rows, body = t.head.rows, t.bodies[1].body
    if #rows == 0 then -- pandoc leaves a two-row header in the body: the spanning row and the one under it
      while body[1].cells:find_if(function(c) return c.col_span > 1 end) do rows:insert(body:remove(1)) end
      rows:insert(body:remove(1))
    end
    local labels = {}
    for _, row in ipairs(rows) do
      local col = 1
      for _, c in ipairs(row.cells) do
        local text = pandoc.utils.blocks_to_inlines(c.contents)
        for k = col, col + c.col_span - 1 do
          labels[k] = (#text == 0 or not labels[k] or #labels[k] == 0) and (labels[k] or pandoc.Inlines({})) .. text or labels[k] .. { pandoc.Space() } .. text
        end
        col = col + c.col_span
      end
    end
    local head = pandoc.Row(pandoc.List(labels):map(function(l) return pandoc.Cell({ pandoc.Plain(l) }) end))
    local plain = pandoc.Table(pandoc.Caption(), t.colspecs, pandoc.TableHead({ head }), t.bodies, t.foot)
    return ('<Table id=%s number="%s">\n\n%s\n\n%s\n\n%s</Table>'):format(jsx(anchor(t.identifier)), t.attributes.number,
      md(t.caption.long), md({ plain }), notes and md(notes.content:walk({ Para = function(p) return pandoc.Plain(p.content) end })) .. '\n\n' or '')
  end

  -- Write each page with its sidebar position; the appendices get their own collapsed category.
  local position = 0
  for _, page in ipairs(list) do
    local out, i = pandoc.List(), 1
    while i <= #page.blocks do
      local b, nextb = page.blocks[i], page.blocks[i + 1]
      if b.t == 'Figure' then out:insert(pandoc.RawBlock('commonmark_x', figure(b)))
      elseif b.t == 'Table' and b.identifier ~= '' then
        local notes = nextb and nextb.t == 'Div' and nextb or nil
        out:insert(pandoc.RawBlock('commonmark_x', tablemd(b, notes)))
        if notes then i = i + 1 end
      else out:insert(b) end
      i = i + 1
    end
    if not page.appendix or page.number == 'A' then position = position + 1 end
    if page.number == 'A' then
      write('appendices/_category_.json', jsx({ label = 'Appendices', position = position, collapsed = true }))
    end
    -- Footnotes sit under a rule and an unnumbered heading, so they show in the TOC (src/css/research.css
    -- hides the list's own label).
    local notes = false
    page.blocks:walk({ Note = function() notes = true end })
    local body = page.mdx or md(out) .. (notes and '\n\n---\n\n## Footnotes {#footnotes}' or '')
    local title = page.number and page.number .. ' ' .. page.title or page.title
    write((page.appendix and 'appendices/' or '') .. page.slug .. '.mdx', ('---\ntitle: %s\nslug: %s\nsidebar_position: %d\n---\n\n%s\n')
      :format(jsx(title), jsx('/thesis/' .. page.slug), page.appendix and page.number:byte() - 64 or position, body))
  end
  return pandoc.Pandoc({})
end
