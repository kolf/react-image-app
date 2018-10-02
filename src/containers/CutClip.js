import React, { Component } from "react";

import Footer from "../components/Footer";
import Cropper from "../components/Cropper";

class CutClip extends Component {
  state = {
    stageWidth: 1
  };

  componentDidMount() {
    const imgUrl = window.localStorage.getItem("imgUrl");
    const width = Math.min(window.innerWidth, 640);

    this.setState({
      stageWidth: width * 0.8,
      imgUrl
    });
  }

  goTo = path => {
    this.props.history.push(path);
  };

  save = () => {
    if (!this.drawingRef) {
      return;
    }

    window.localStorage.setItem("imgUrl", this.drawingRef.getImage());
    this.goTo("/editor-image");
  };

  render() {
    const { stageWidth, imgUrl } = this.state;

    if (!imgUrl) {
      return <div className="page" />;
    }

    return (
      <div className="page">
        <div className="body">
          <div className="stage">
            <Cropper
              stageRef={f => (this.stage = f)}
              style={{ background: "#333" }}
              height={stageWidth}
              width={stageWidth}
            >
              <Cropper.Drawing
                src={imgUrl}
                maxWidth={stageWidth}
                maxHeight={stageWidth}
                imageRef={(ref, f) => (this.drawingRef = f)}
              />
            </Cropper>
          </div>
        </div>
        <Footer>
          <Footer.CancelIcon onClick={e => this.goTo(`/image-upload/index`)} />
          <Footer.Title>图割抠图</Footer.Title>
          <Footer.OkIcon onClick={this.save} />
        </Footer>
      </div>
    );
  }
}

export default CutClip;
