import React, { Component } from "react";
import Layout, { A, TitleBar, BackButton } from "../components/Layout";
import withSubs from "../components/withSubs";
import FBImage from "../components/FBImage";
import map from "lodash/map";
import reduce from "lodash/reduce";
import uniq from "lodash/uniq";
import each from "../lib/each";
import cn from "classnames";

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
  state = {
    selectedEmotion: null
  };

  static getInitialProps({ query }) {
    return { dumpKey: query.key };
  }

  selectEmotion = emotion => {
    this.setState(state => ({
      selectedEmotion: state.selectedEmotion === emotion ? null : emotion
    }));
  };

  render() {
    const { dump, faces } = this.props;
    const { selectedEmotion } = this.state;

    const emotions = calculateEmotions(faces);

    return (
      <Layout>
        <TitleBar backButtonHref="/">
          {dump.timeCreated.split("T")[0]}
        </TitleBar>
        <header className="flex flex-wrap items-stretch f2-ns f4">
          {map(emotions, (avg, emotion) =>
            <Emotion
              key={emotion}
              selected={selectedEmotion === emotion}
              avg={avg}
              emotion={emotion}
              onClick={this.selectEmotion.bind(this, emotion)}
            >
              {emojies[emotion]}
            </Emotion>
          )}
        </header>
        <div className="flex flex-wrap">
          {map(faces, (face, key) =>
            <FBImage
              ref={face.name}
              fbRef={`gs://${face.image.bucket}/${face.image.name}`}
              className="w3 h3 db fl"
              style={{ opacity: calculateOpacity(face, selectedEmotion) }}
            />
          )}
        </div>
      </Layout>
    );
  }
}

function calculateOpacity(face, selectedEmotion) {
  return selectedEmotion
    ? Math.max(
        0.25,
        Math.min(1, face.faceAttributes.emotion[selectedEmotion] * 1.5)
      )
    : 1;
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

const Emotion = ({ avg, selected, emotion, children, ...props }) =>
  <div
    className={cn(
      "flex-auto w-25 w-auto-ns",
      "pointer dib pv3 ph2",
      "flex flex-column items-center justify-end",
      { "bg-dark-gray": selected }
    )}
    {...props}
  >
    <div
      className="w-100 bg-yellow mb2 br2"
      style={{ height: `${Math.round(avg * 50)}px` }}
    />
    {children}
  </div>;

export default withSubs((props, db) => ({
  dump: db.ref(`data/dumps/${props.dumpKey}`),
  faces: db.ref(`data/faces/${props.dumpKey}`)
}))(Dump);
