import React, { Component } from "react";
import Layout, { A } from "../components/Layout";
import withSubs from "../components/withSubs";
import FBImage from "../components/FBImage";
import map from "lodash/map";
import reduce from "lodash/reduce";
import each from "../lib/each";

const emojies = {
  anger: "😡",
  contempt: "😒",
  disgust: "🤢",
  fear: "😱",
  happiness: "😄",
  neutral: "😐",
  sadness: "😭",
  surprise: "😳"
};

class Dump extends Component {
  static getInitialProps({ query }) {
    return { dumpKey: query.key };
  }

  render() {
    const { faces } = this.props;

    const emotions = calculateEmotions(faces);

    return (
      <Layout>
        <header className="flex flex-wrap items-stretch f2">
          {map(emotions, (avg, emotion) =>
            <div
              key={emotion}
              className="flex-auto w-25 w-auto-ns pointer dib pv3 flex flex-column items-center justify-end"
            >
              <div className='w-100 bg-yellow mb2' style={{height: `${Math.round(avg * 50)}px`}} />
              {emojies[emotion]}
            </div>
          )}
        </header>
        <div className="flex flex-wrap">
          {map(faces, (face, key) =>
            <FBImage
              ref={key}
              fbRef={`gs://${face.image.bucket}/${face.image.name}`}
              className="w3 h3 db fl"
            />
          )}
        </div>
      </Layout>
    );
  }
}

function calculateEmotions(faces) {
  if (!faces) return;

  const emotions = reduce(
    faces,
    (stats, face, key) => {
      each(stats, (values, emotion) => {
        values.push(face.faceAttributes.emotion[emotion]);
      });
      return stats;
    },
    {
      anger: [],
      contempt: [],
      disgust: [],
      fear: [],
      happiness: [],
      neutral: [],
      sadness: [],
      surprise: []
    }
  );

  return reduce(
    emotions,
    (obj, values, key) => {
      obj[key] = reduce(values, (sum, val) => sum + val, 0) / values.length;
      return obj;
    },
    {}
  );
}

export default withSubs((props, db) => ({
  dump: db.ref(`data/dumps/${props.dumpKey}`),
  faces: db.ref(`data/faces/${props.dumpKey}`)
}))(Dump);
