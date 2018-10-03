import React, { Component } from "react";
import { createObjectURL, canvasToBlob } from "blob-util";
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

  saveStage = () => {
    if (!this.drawingRef) {
      return;
    }

    canvasToBlob(this.drawingRef.getResult(), "image/png").then(blob => {
      window.localStorage.setItem("imgUrl", createObjectURL(blob));
      this.goTo(`/editor-image`);
    });
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
          <Footer.OkIcon onClick={this.saveStage} />
        </Footer>
      </div>
    );
  }
}

export default CutClip;
