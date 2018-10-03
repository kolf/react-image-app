import React, { Component } from "react";
import Konva from "konva";
import { createObjectURL, canvasToBlob } from "blob-util";
import { withStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/lab/Slider";

import Footer from "../components/Footer";
import Cropper from "../components/Cropper";

const s = {
  slider: {
    position: "absolute",
    left: 0,
    width: "100%",
    bottom: "2rem",
    background: "#222",
    padding: "0.5rem 1rem"
  }
};

class FilterClip extends Component {
  state = {
    stageWidth: 1,
    value: 100
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
    if (!this.stage) {
      return;
    }

    canvasToBlob(this.stage.getStage(), "image/png").then(blob => {
      window.localStorage.setItem("imgUrl", createObjectURL(blob));
      this.goTo(`/editor-image`);
    });
  };

  imageRef = f => {
    if (f) {
      this.image = f;
      this.image.cache();
    }
  };

  handleChange = (e, value) => this.setState({ value });

  render() {
    const { classes } = this.props;
    const { stageWidth, imgUrl, value } = this.state;

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
              <Cropper.Image
                maxWidth={stageWidth}
                maxHeight={stageWidth}
                x={stageWidth / 2}
                y={stageWidth / 2}
                center
                src={imgUrl}
                imageRef={this.imageRef}
                filters={[Konva.Filters.Mask]}
                threshold={value}
              />
            </Cropper>
          </div>
        </div>
        <div className={classes.slider}>
          <Slider
            value={value}
            aria-labelledby="label"
            onChange={this.handleChange}
          />
        </div>
        <Footer>
          <Footer.CancelIcon onClick={e => this.goTo(`/image-upload/index`)} />
          <Footer.Title>阈值抠图</Footer.Title>
          <Footer.OkIcon onClick={e => this.saveStage()} />
        </Footer>
      </div>
    );
  }
}

export default withStyles(s)(FilterClip);
