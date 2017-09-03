import withSubs from "../components/withSubs";
import Link from "next/link";
import Layout, { A } from "../components/Layout";
import map from "lodash/map";
import FBImage from "../components/FBImage";

const Index = ({ dumps }) =>
  <Layout>
    {map(dumps, (dump, key) =>
      <div className='w5 h5 overflow-hidden dib' key={key}>
        <Link>
          <a href={`/dumps/${key}`}>
            <FBImage fbRef={`gs://${dump.bucket}/${dump.name}`} className='w-100'/>
          </a>
        </Link>
      </div>
    )}
  </Layout>;

export default withSubs((props, db) => ({
  dumps: db.ref("data/dumps")
}))(Index);
