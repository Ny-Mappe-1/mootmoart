import React, { Component } from "react";
import each from "../lib/each";

export default refsFn => Child => {
  return class WithSubs extends Component {
    static async getInitialProps({ req }) {
      let db

      if (!req) {
        const { default: fb } = await import("../firebase.client");
        db = fb.database()
      } else {
        db = req.firebaseServer.database()
      }

      const props = {};

      if (Child.getInitialProps) {
        const childProps = await Child.getInitialProps.apply(null, arguments);
        Object.assign(props, childProps);
      }

      const refs = refsFn(props, db)

      await Promise.all(
        Object.keys(refs).map(key =>
          refs[key]
            .once("value")
            .then(snap => Object.assign(props, { [key]: snap.val() || [] }))
        )
      );

      return props;
    }

    async componentDidMount() {
      const { default: fb } = await import("../firebase.client");
      this.fb = fb

      this.refs = refsFn(this.props, fb.database())

      Object.keys(this.refs).forEach(key => {
        this.refs[key].on("value", snap => {
          const collection = snap.val();
          const change = { [key]: collection };
          if (collection) this.setState(() => change);
        });
      });
    }

    componentWillUnmount() {
      Object.keys(this.refs).forEach((sub, key) => {
         this.fb.database().ref(sub).off("value");
      });
    }

    render() {
      return <Child {...this.props} {...this.state} />;
    }
  };
};
