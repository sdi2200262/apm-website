import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import NEWS from '../../data/news';
import { useNewsSeen } from '../../hooks/useNewsSeen';
import styles from './NewsButton.module.css';

const TYPE_LABELS = {
  release: 'RELEASE',
  other: 'OTHER',
};

const CLOSE_ANIMATION_MS = 220;

function formatDate(iso) {
  if (!iso || typeof iso !== 'string') return '';
  return iso.replaceAll('-', '.');
}

export default function NewsButton({ items = NEWS }) {
  // 'closed' | 'open' | 'closing' — closing keeps the panel mounted
  // long enough for the slide-out animation to play.
  const [state, setState] = useState('closed');
  const [anchor, setAnchor] = useState(null); // {top, right} for desktop; null on mobile
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const closeTimerRef = useRef(null);
  const { hasUnread, markAllSeen } = useNewsSeen(items);

  const isMounted = state !== 'closed';
  const isOpen = state === 'open';
  const isClosing = state === 'closing';

  // Compute anchor position from trigger rect (desktop only). On mobile the
  // CSS centers the popover in the viewport, so we skip the anchor.
  const computeAnchor = () => {
    if (typeof window === 'undefined') return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      setAnchor(null);
      return;
    }
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAnchor({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };

  const beginClose = () => {
    if (state !== 'open') return;
    setState('closing');
    closeTimerRef.current = setTimeout(() => {
      setState('closed');
      closeTimerRef.current = null;
    }, CLOSE_ANIMATION_MS);
  };

  const toggle = () => {
    if (state === 'closed') {
      computeAnchor();
      setState('open');
      markAllSeen();
    } else if (state === 'open') {
      beginClose();
    }
  };

  // Recompute anchor on viewport changes while open
  useEffect(() => {
    if (!isOpen) return undefined;
    const onChange = () => computeAnchor();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [isOpen]);

  // Cleanup pending close timer on unmount
  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  // Outside click → close (popover is portaled, so check both refs)
  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e) => {
      const inTrigger = wrapRef.current && wrapRef.current.contains(e.target);
      const inPopover = popoverRef.current && popoverRef.current.contains(e.target);
      if (!inTrigger && !inPopover) beginClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Escape → close
  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') {
        beginClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Lock body scroll on mobile while sheet is open (incl. during slide-out)
  useEffect(() => {
    if (!isMounted) return undefined;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMounted]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={hasUnread ? 'News (unread)' : 'News'}
      >
        <span>News</span>
        {hasUnread && <span className={styles.dot} aria-hidden="true" />}
      </button>

      {isMounted && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ''}`}
            onClick={beginClose}
            aria-hidden="true"
          />
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Latest news"
            className={`${styles.popover} ${isClosing ? styles.popoverClosing : ''}`}
            style={anchor ? { top: `${anchor.top}px`, right: `${anchor.right}px` } : undefined}
          >
            <div className={styles.header}>
              <span className={styles.headerLabel}>NEWS</span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={beginClose}
                aria-label="Close news panel"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className={styles.empty}>No news yet.</div>
            ) : (
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.itemLink}
                    >
                      <div className={styles.itemMeta}>
                        <span className={`${styles.tag} ${styles[`tag_${item.type}`] || ''}`}>
                          {TYPE_LABELS[item.type] || 'NEWS'}
                        </span>
                        <span className={styles.date}>{formatDate(item.date)}</span>
                      </div>
                      <div className={styles.itemTitle}>{item.title}</div>
                      {item.description && (
                        <div className={styles.itemDesc}>{item.description}</div>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
