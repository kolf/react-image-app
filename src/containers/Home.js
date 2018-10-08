import React, { Component } from "react";
import axios from "axios";
import { getQueryString, uid } from "../utils";

import Footer from "../components/Footer";
import Cropper from "../components/Cropper";

import Transformer from "../components/Transformer";
import Prompt from "../components/Prompt";

import imageIcon from "../assets/image.gif";
import textIcon from "../assets/text.gif";

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
    activeKey: "",
    stageWidth: 1
  };

  componentDidMount() {
    this.setState({
      stageWidth: Math.min(window.innerWidth, 640) * 0.8
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
    const { imageMap } = this.state;
    const stageJson = JSON.parse(window.localStorage.getItem("stageJson"));
    const stageKey = window.localStorage.getItem("stageKey"); // 保存并发布后清除

    if (stageJson && stageKey) {
      const images = (stageJson.children[0] || {}).children || [];

      for (const { attrs } of images) {
        const key = attrs.uid;
        if (!/bg|image|text/g.test(key)) {
          break;
        }
        const rotation = attrs.rotation || 0;
        imageMap.set(key, {
          ...attrs,
          rotation,
          uid: key
        });
      }
    } else {
      const srcUrl = await this.loadScrUrl();
      this.push({
        src: srcUrl
      });
    }
    if (imageMap.size > 0) {
      this.setState(
        { imageMap, activeKey: [...imageMap.keys()][0] },
        this.saveStage
      );
    }
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
      window.localStorage.setItem("stageJson", stageJson);
      window.localStorage.setItem("stageKey", Date.now());
    }
  };

  onUpload = e => {
    Prompt.message(<span>上传成功</span>);
  };

  handlePressMove = e => {
    const { activeKey, imageMap } = this.state;

    if (!activeKey) {
      return;
    }

    const image = imageMap.get(activeKey);

    this.updateImage({
      x: e.deltaX + image.x,
      y: e.deltaY + image.y
    });
  };

  handlePinch = e => {
    const { activeKey, imageMap } = this.state;

    if (!activeKey) {
      return;
    }

    const image = imageMap.get(activeKey);
    const scale = e.zoom * image.initScale;

    this.updateImage({
      scaleX: scale,
      scaleY: scale
    });
  };

  handleRotate = e => {
    const { activeKey, imageMap } = this.state;

    if (!activeKey) {
      return;
    }

    const image = imageMap.get(activeKey);
    this.updateImage({
      rotation: e.angle + image.rotation
    });
  };

  hanleMultipointStart = e => {
    const { activeKey, imageMap } = this.state;

    if (!activeKey) {
      return;
    }

    const image = imageMap.get(activeKey);
    this.updateImage(
      {
        initScale: image.scaleX || 1
      },
      false
    );
  };

  updateImage = (props, update = true) => {
    const { activeKey, imageMap } = this.state;

    if (!activeKey) return;

    const image = imageMap.get(activeKey);
    imageMap.set(activeKey, {
      ...image,
      ...props
    });

    if (update) {
      this.forceUpdate();
    }
  };

  render() {
    const { imageMap, stageWidth } = this.state;
    const images = [...imageMap.values()];

    if (images.length === 0) {
      return <div className="page" />;
    }

    return (
      <div className="page">
        <div className="body">
          <div className="stage">
            <Transformer
              onMultipointStart={this.hanleMultipointStart}
              onPinch={this.handlePinch}
              onPressMove={this.handlePressMove}
              onRotate={this.handleRotate}
            >
              <Cropper
                style={{ background: "#333" }}
                stageRef={f => (this.stageRef = f)}
                width={stageWidth}
              >
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
