import React, { Component } from "react";

export default refsFn => Child => {
  return class WithSubs extends Component {
    static async getInitialProps({ req }) {
      console.log(req.firebase)
      const props = {};

      if (Child.getInitialProps) {
        const childProps = await Child.getInitialProps.apply(null, arguments);
        Object.assign(props, childProps);
      }

      const refs = refsFn(props, req.firebaseServer.database())

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

      const refs = refsFn(this.props, fb.database())

      Object.keys(refs).forEach(key => {
        refs[key].on("value", snap => {
          const collection = snap.val();
          const change = { [key]: collection };
          if (collection) this.setState(() => change);
        });
      });
    }

    componentWillDismount() {
      console.log("dismount");
      Object.keys(this.props.refs).forEach(key => {
         fb.database().ref(this.props.refs[key]).off("value");
      });
    }

    render() {
      return <Child {...this.props} {...this.state} />;
    }
  };
};
