import React, { Component } from "react";
import localforage from "localforage";
import axios from "axios";
import { dataURLToBlob } from "blob-util";
import ReactCrop from "react-easy-crop";
import Footer from "../components/Footer";
import { loadImage } from "../components/Cropper/utils";
import { getQueryString } from "../utils";

const API_ROOT = "http://gold.dreamdeck.cn";


function getCroppedImg(image, pixelCrop, callback) {
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

  callback(canvas);
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

  upload = (canvas, callback) => {
    const data = new FormData();
    const file = dataURLToBlob(canvas.toDataURL("image/png"));
    data.append("imgFile", file);
    axios
      .post(`${API_ROOT}/mc/app/write/v1/base/photo/h5/upload`, data, {
        headers: { "content-type": "multipart/form-data" }
      })
      .then(res => {
        const { data } = res;
        if (data.code != "00") {
          alert(data.msg);
        } else {
          const imgUrl = `${API_ROOT}/app/icons${data.object.imgPath}`;
          callback(imgUrl);
        }
      });
  };

  saveStage = () => {
    getCroppedImg(this.imageObj, this.croppedAreaPixels, canvas => {
      this.upload(canvas, imgUrl => {
        localforage.setItem("imgUrl", imgUrl).then(() => {
          this.goTo("/photo/image-upload/index");
        });
      });
    });
  };

  upload = (canvas, callback) => {
    const data = new FormData();
    const file = dataURLToBlob(canvas.toDataURL("image/png"));
    data.append("imgFile", file);
    axios
      .post(`${API_ROOT}/mc/app/write/v1/base/photo/h5/upload`, data, {
        headers: { "content-type": "multipart/form-data" }
      })
      .then(res => {
        const { data } = res;
        if (data.code != "00") {
          alert(data.msg);
        } else {
          const imgUrl = `${API_ROOT}/app/icons${data.object.imgPath}`;
          callback(imgUrl);
        }
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
          <Footer.OkIcon onClick={this.saveStage} />
        </Footer>
      </div>
    );
  }
}

export default Clipping;
