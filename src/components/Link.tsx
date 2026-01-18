import {AnchorHTMLAttributes, FC, MouseEvent} from 'react';

import {useNavigate} from "../hooks/useNavigate";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  replace?: boolean;
  state?: any;
  prefetch?: boolean;
}

export const Link: FC<LinkProps> = (props) => {
  const {
    to,
    replace,
    state,
    prefetch,
    onClick,
    children,
    ...rest
  } = props
  const {navigate} = useNavigate();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Allow ctrl/cmd+click to open in new tab
    if (e.metaKey || e.ctrlKey) return;

    e.preventDefault();
    navigate(to, {replace, state});
    onClick?.(e);
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}