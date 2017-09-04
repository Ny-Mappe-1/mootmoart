import Head from "next/head";
import cn from "classnames";
import Link from "next/link";

export default ({ className, children, ...props }) =>
  <div className={cn("sans-serif", className)} {...props}>
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        rel="stylesheet"
        href="https://unpkg.com/tachyons@4.8.0/css/tachyons.min.css"
      />
      <title>mootmoart</title>
    </Head>

    {children}

    <style jsx global>{`
      html {
        height: 100%;
      }
      body {
        min-height: 100%;
        background-color: #222;
      }
      .icon {
        width: 1em;
        height: 1em;
        vertical-align: middle;
      }
    `}</style>
  </div>;

export const A = ({ className, ...props }) =>
  <a className={cn("link blue", className)} {...props} />;

export const BackButton = ({ href, ...props }) =>
  <Link prefetch href={href} {...props}>
    <a className="link dib flex items-center justify-center pa2 mr2">
      <img src="https://icon.now.sh/chevron/left" className="icon" />
    </a>
  </Link>;

export const TitleBar = ({ children, backButtonHref, ...props }) =>
  <nav className="bg-yellow ph2 pv1 black flex items-center justify-center b mb2" {...props}>
    {backButtonHref && <BackButton href={backButtonHref} />}
    <div className='pv1 flex-auto flex justify-center items-center'>{children}</div>
  </nav>;
