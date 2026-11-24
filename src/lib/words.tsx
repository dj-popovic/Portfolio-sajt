import { cloneElement, Fragment, isValidElement, type CSSProperties, type ReactNode } from "react";

/**
 * Wraps each word of rich text in `<span class="hw" style="--i: n">`, through nested tags
 * (the <glow> word), so CSS can bring them in one after another (the hero's title). The
 * spaces stay text between the spans, where lines break; a <br> stays a <br>. Server-side,
 * so the entrance needn't wait for script to split the title first.
 */
export function splitWords(node: ReactNode): ReactNode {
  let i = 0;
  const walk = (n: ReactNode): ReactNode => {
    if (typeof n === "string") {
      return n
        .split(/(\s+)/)
        .filter(Boolean)
        .map((part, k) =>
          /^\s+$/.test(part) ? (
            part
          ) : (
            <span key={k} className="hw" style={{ "--i": i++ } as CSSProperties}>
              {part}
            </span>
          ),
        );
    }
    if (Array.isArray(n)) return n.map((child, k) => <Fragment key={k}>{walk(child)}</Fragment>);
    if (isValidElement<{ children?: ReactNode }>(n) && n.props.children !== undefined) {
      return cloneElement(n, undefined, walk(n.props.children));
    }
    return n;
  };
  return walk(node);
}
