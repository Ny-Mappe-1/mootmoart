import Head from "next/head";
import cn from "classnames";

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
      html { height: 100%; }
      body {
        min-height: 100%;
        background-color: #222;
      }
    `}</style>
  </div>;

export const A = ({ className, ...props }) =>
  <a className={cn('link blue', className)} {...props} />
