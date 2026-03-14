import React from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import BrowserOnly from '@docusaurus/BrowserOnly';
import DocToolbar from '@site/src/components/DocToolbar';
import styles from './styles.module.css';

const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

export default function TOC({className, ...props}) {
  return (
    <div className={clsx(styles.tableOfContents, 'thin-scrollbar', className)}>
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
      <BrowserOnly>{() => <DocToolbar />}</BrowserOnly>
    </div>
  );
}
