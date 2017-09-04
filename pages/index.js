import withSubs from "../components/withSubs";
import Link from "next/link";
import Layout, { A, TitleBar, BackButton } from "../components/Layout";
import map from "lodash/map";
import reverse from "lodash/reverse";
import FBImage from "../components/FBImage";

const Index = ({ dumps }) =>
  <Layout>
    <TitleBar>mootmoart</TitleBar>
    <div className="pa3 flex-ns flex-wrap nl2 nr2 mh1">
      {map(reverse(Object.keys(dumps)), key => {
        const dump = dumps[key];
        return (
          <div key={key} className="ph2 mb3 w-50-ns ">
            <div className="bg-white shadow-1 br2 overflow-hidden tc flex-none">
              <div className="w-100 h5 dib overflow-hidden">
                <Link>
                  <a href={`/dumps/${key}`}>
                    <FBImage
                      fbRef={`gs://${dump.bucket}/${dump.name}`}
                      className="w-100 db"
                    />
                  </a>
                </Link>
              </div>
              <div className="pa1 f6 b">
                {dump.timeCreated.split("T")[0]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </Layout>;

export default withSubs((props, db) => ({
  dumps: db.ref("data/dumps")
}))(Index);
