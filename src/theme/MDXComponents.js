import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import Diagram from '@site/src/components/Diagram';
import { Table, Reference } from '@site/src/components/Thesis';

// Every Markdown table (docs and thesis reader) fills the column and scrolls sideways inside its own box when
// wider ("Tables" in src/css/custom.css). Diagram, Table and Reference are used by the generated thesis pages
// (scripts/thesis.lua) without importing them.
export default {
  ...MDXComponents,
  table: (props) => <div className="table-scroll"><table {...props} /></div>,
  Diagram,
  Table,
  Reference,
};
