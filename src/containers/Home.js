import React, { Component } from "react";
import axios from "axios";
import localforage from "localforage";
import { createObjectURL, canvasToBlob, dataURLToBlob } from "blob-util";

import { getQueryString, uid } from "../utils";

import Footer from "../components/Footer";
import Cropper from "../components/Cropper";

import Transformer from "../components/Transformer";

import imageIcon from "../assets/image.gif";
import textIcon from "../assets/text.gif";

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n) {
    u8arr[n] = bstr.charCodeAt(n);
    n -= 1; // to make eslint happy
  }
  return new File([u8arr], filename, { type: mime });
};

const API_ROOT = "http://gold.dreamdeck.cn";
const FooterItem = Footer.Item;

const footers = [
  {
    text: "图片",
    path: "/photo/editor-image",
    icon: imageIcon
  },
  {
    text: "文字",
    path: "/photo/editor-text",
    icon: textIcon
  }
];

class Home extends Component {
  state = {
    imageMap: new Map(),
    jmfUser: null,
    jmfProductId: "",
    activeKey: "",
    stageWidth: 1,
    uploading: false,
    colorId: "000000",
    stage: {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      initScale: 1
    }
  };

  defaultStage = null;

  componentDidMount() {
    const stageWidth = Math.min(window.innerWidth, 640) * 0.8;
    this.defaultStage = {
      ...this.state.stage,
      x: stageWidth / 2,
      y: stageWidth / 2,
      offset: {
        x: stageWidth / 2,
        y: stageWidth / 2
      }
    };
    this.setState({
      stageWidth,
      stage: {
        ...this.defaultStage
      }
    });
    this.initStage();
  }

  loadScrUrl = () => {
    const imgId = getQueryString("getQueryString") || "img01";

    return axios
      .get(`${API_ROOT}/mc/app/read/v1/base/box/img/info?imgId=${imgId}`)
      .then(
        res => `${API_ROOT}/app/icons${res.data.object.baseBoxImgInfo.imgPath}`
      );
  };

  initStage = async () => {
    localforage.getItem("jmfUser").then(v => {
      console.log("jmfUser-----" + v);
      this.jmfUser = JSON.parse(v);
    });
    localforage.getItem("jmfProductId").then(v => {
      console.log("jmfProductId-----" + v);
      this.jmfProductId = v;
    });
    const { imageMap } = this.state;
    const colorId = getQueryString("color");
    const stageKey = await localforage.getItem("stageKey"); // 保存并发布后清除
    let stageJson = await localforage.getItem("stageJson");

    if (typeof stageJson === "string") {
      stageJson = JSON.parse(stageJson);
    }

    if (stageJson) {
      const images = (stageJson.children[0] || {}).children || [];

      for (const { attrs } of images) {
        const key = attrs.uid;
        if (!/bg|image|text/g.test(key)) {
          continue;
        }
        const rotation = attrs.rotation || 0;
        imageMap.set(key, {
          ...attrs,
          rotation,
          uid: key
        });
      }

      // console.log(images, "images");
    }

    if (imageMap.size > 0) {
      this.setState(
        { imageMap, activeKey: [...imageMap.keys()][0], colorId },
        this.saveStage
      );
    } else {
      this.setState({
        colorId
      });
    }

    localforage.setItem("colorId", colorId);
  };

  push = ({ src }) => {
    const { stageWidth, imageMap } = this.state;
    const key = uid.get("bg-");

    imageMap.set(key, {
      x: stageWidth / 2,
      y: stageWidth / 2,
      maxWidth: stageWidth,
      maxHeight: stageWidth,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      src,
      uid: key
    });
  };

  saveStage = e => {
    if (this.stageRef) {
      const stageJson = this.stageRef.getStage().toJSON();
      localforage.setItem("stageJson", stageJson);
      localforage.setItem("stageKey", Date.now());
    }
  };

  onUpload = e => {
    this.setState(
      {
        stage: {
          ...this.defaultStage,
          x: 0,
          y: 0,
          offset: {
            x: 0,
            y: 0
          }
        },
        uploading: true
      },
      () => {
        const data = new FormData();
        const file = dataURLToBlob(this.stageRef.getStage().toDataURL());
        data.append("imgFile", file);
        data.append("userId", this.jmfUser.userId);
        data.append("productId", this.jmfProductId);
        axios
          .post(`${API_ROOT}/mc/app/write/v1/base/img/edit/upload`, data, {
            headers: { "content-type": "multipart/form-data" }
          })
          .then(res => {
            if (res.data.code != "00") {
              alert(res.data.msg);
            } else {
              window.location.href =
                "http://gold.dreamdeck.cn/photo/success.html";
            }
          })
          .catch(error => {
            alert("上传失败，请重试！");
          });
      }
    );
  };

  goTo = (path, state) => {
    this.props.history.push(path);
  };

  // handlePressMove = e => {
  //   const { stage } = this.state;

  //   this.updateStage({
  //     x: e.deltaX + stage.x,
  //     y: e.deltaY + stage.y
  //   });
  // };
  handlePressMove = e => {
    const {
      activeKey,
      stage,
      stageWidth
    } = this.state;

    if (!activeKey) {
      return;
    }

    if (stage.scaleX <= 1) {
      return false;
    }

    const x = Math.max(
      Math.min(stageWidth * 1.1, e.deltaX + stage.x),
      stageWidth * -0.1
    );

    const y = Math.max(
      Math.min(stageWidth * 1.1, e.deltaY + stage.y),
      stageWidth * -0.1
    );

    this.updateStage({
      x,
      y
    });
  };

  handlePinch = e => {
    const { stage } = this.state;
    const scale = Math.max(e.zoom * stage.initScale, 1);

    this.updateStage({
      scaleX: scale,
      scaleY: scale
    });
  };

  hanleMultipointStart = e => {
    const { stage } = this.state;

    this.updateStage({
      initScale: stage.scaleX || 1
    });
  };

  updateStage = (props, callback) => {
    this.setState(
      {
        stage: {
          ...this.state.stage,
          ...props
        }
      },
      () => {
        callback && callback();
      }
    );
  };

  render() {
    const { imageMap, stageWidth, stage, uploading, colorId } = this.state;
    const images = [...imageMap.values()];

    return (
      <div className="page">
        <div className="body">
          <div className="stage">
            <Transformer
              onMultipointStart={this.hanleMultipointStart}
              onPinch={this.handlePinch}
              onPressMove={this.handlePressMove}
            >
              <Cropper
                layerProps={{
                  ...stage
                }}
                style={{ background: "#" + colorId }}
                stageRef={f => (this.stageRef = f)}
                width={stageWidth}
              >
                {!uploading && (
                  <Cropper.Rect
                    name="stageColor"
                    fill={"#" + colorId}
                    width={stageWidth}
                    height={stageWidth}
                  />
                )}
                {images.map(image => {
                  const key = image.uid;
                  return /image|bg/.test(key) ? (
                    <Cropper.Image key={key} {...image} center />
                  ) : (
                    <Cropper.Text key={key} {...image} />
                  );
                })}
              </Cropper>
            </Transformer>
            <div className="save-btn">
              <span onClick={this.onUpload}>保存并上传</span>
            </div>
          </div>
        </div>

        <Footer>
          {footers.map((f, i) => (
            <FooterItem key={f.path + i} icon={f.icon} path={`${f.path}`}>
              {f.text}
            </FooterItem>
          ))}
        </Footer>
      </div>
    );
  }
}

export default Home;
