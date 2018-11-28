import React, { Component } from "react";
import localforage from "localforage";
import axios from "axios";
import { createObjectURL, canvasToBlob } from "blob-util";
import ReactCrop from "react-easy-crop";
import Footer from "../components/Footer";
import { loadImage } from "../components/Cropper/utils";
import { getQueryString } from "../utils";

function getCroppedImg(image, pixelCrop) {
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvasToBlob(canvas, "image/png");
}
class Clipping extends Component {
  state = {
    imgUrl: "",
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 1
  };

  imageObj = null;
  croppedAreaPixels = null;

  async componentDidMount() {
    const imgUrl = await getQueryString("imgUrl");
    // alert(imgUrl)
    const width = Math.min(window.innerWidth, 640);

    loadImage(imgUrl, "image/png").then(image => {
      this.imageObj = image;
    });

    this.setState({
      imgUrl,
      width
    });
  }

  onCropChange = crop => {
    this.setState({ crop });
  };

  onCropComplete = (croppedArea, croppedAreaPixels) => {
    this.croppedAreaPixels = croppedAreaPixels;
  };

  onZoomChange = zoom => {
    this.setState({ zoom });
  };

  goTo = (path, state) => {
    this.props.history.push(path);
  };

  save = () => {
    getCroppedImg(this.imageObj, this.croppedAreaPixels).then(blob => {
      localforage.setItem("imgUrl", createObjectURL(blob)).then(imgUrl => {
        this.goTo("/photo/image-upload/index");
      });
    });
  };

  render() {
    const { imgUrl, crop, zoom, aspect } = this.state;
    return (
      <div className="page">
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 40
          }}
        >
          <ReactCrop
            image={imgUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={this.onCropChange}
            onCropComplete={this.onCropComplete}
            onZoomChange={this.onZoomChange}
          />
        </div>
        <Footer>
          <Footer.CancelIcon
            onClick={e => this.goTo(`/photo/image-upload/index`)}
          />
          <Footer.Title>裁切</Footer.Title>
          <Footer.OkIcon onClick={this.save} />
        </Footer>
      </div>
    );
  }
}

export default Clipping;
