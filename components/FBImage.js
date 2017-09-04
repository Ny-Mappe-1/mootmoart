import React, { Component } from "react";

export default class FBImage extends Component {
  state = { src: null };

  static defaultProps = {
    placeholderSrc: "https://placehold.it/80x80/555/ccc&text=%E2%80%A6"
  };

  async componentDidMount() {
    const { default: fb } = await import("../firebase.client");

    fb.storage().refFromURL(this.props.fbRef).getDownloadURL().then(url => {
      this.setState(() => ({ src: url }));
    });
  }

  render() {
    const { placeholderSrc, fbRef, ...props } = this.props;
    const src = this.state.src || placeholderSrc;

    return <img src={src} {...props} />;
  }
}
