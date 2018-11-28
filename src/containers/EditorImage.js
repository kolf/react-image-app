import React, { Component } from "react";
import Upload from "rc-upload";
import axios from "axios";
import localforage from "localforage";
import Footer from "../components/Footer";
import Cropper from "../components/Cropper";
import Transformer from "../components/Transformer";

import uploadUrl from "../assets/upload.gif";
import tukuUrl from "../assets/tk.png";

import { uid, isWindow } from "../utils";

const API_ROOT = "http://gold.dreamdeck.cn";

const Thumbs = ({ items, onClick }) => {
  const uploadProps = {
    className: "upload-btn",
    name: "imgFile",
    action: `${API_ROOT}/mc/app/write/v1/base/photo/upload`,
    // accept: "image/gif,image/png,image/jpeg,image/jpg,image/bmp",
    onSuccess(file) {
      const {
        object: { imgPath }
      } = file;
      onClick({
        key: "upload",
        url: `${API_ROOT}/app/icons${imgPath}`
      });
    }
  };

  const UploadBtn = (
    <Upload {...uploadProps}>
      <img src={uploadUrl} alt="upload" />
    </Upload>
  );

  const linkBtn = (
    <span
      className="upload-btn"
      onClick={e => {
        onClick({ key: "upload" });
      }}
    >
      <img src={uploadUrl} alt="upload" />
    </span>
  );

  return (
    <div className="upload-image-root">
      <div className="upload-box">
        {linkBtn}
        <div className="upload-list">
          <ul style={{ width: `${3.6 * (items.length + 1)}rem` }}>
            <li key="resources" onClick={e => onClick({ key: "resources" })}>
              <img src={tukuUrl} alt="大师图库" />
            </li>
            {items.map(item => (
              <li key={item.key} onClick={e => onClick(item)}>
                <img src={item.url} alt={item.url} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

class EditorImage extends Component {
  state = {
    thumbs: [],
    imageMap: new Map(),
    activeKey: "",
    stageWidth: 1
  };

  index = 0;
  colorId = "000000";

  componentDidMount() {
    this.state.stageWidth = Math.min(window.innerWidth, 640) * 0.8;
    this.initStage();
    this.loadThumbs();
  }

  loadThumbs = async () => {
    const thumbs = await axios
      .get(`${API_ROOT}/mc/base/read/v1/base/icon/list?isHot=1`)
      .then(res =>
        res.data.object.baseIconList.map(item => ({
          url: `${API_ROOT}/app/icons${item.iconPath}`,
          key: item.iconId
        }))
      );

    this.setState({
      thumbs
    });
  };

  initStage = async () => {
    const { imageMap } = this.state;
    const imgUrl = await localforage.getItem("imgUrl");
    const resImgUrl = await localforage.getItem("resImgUrl");
    const colorId = await localforage.getItem("colorId");
    let stageJson = await localforage.getItem("stageJson");

    if (typeof stageJson === "string") {
      stageJson = JSON.parse(stageJson);
    }

    if (stageJson) {
      const images = stageJson.children[0].children;

      for (const { attrs } of images) {
        const key = attrs.uid;

        if (!/bg|image|text/g.test(key)) {
          continue;
        }
        const rotation = attrs.rotation || 0;
        imageMap.set(key, {
          ...attrs,
          rotation,
          uid: key,
          index: this.index++
        });
      }
    }

    if (imgUrl) {
      localforage.removeItem("imgUrl");
      this.handleThumbClick({
        url: imgUrl
      });
    }
    if (resImgUrl) {
      localforage.removeItem("resImgUrl");
      this.handleThumbClick({
        url: resImgUrl
      });
    }

    this.colorId = colorId;
    this.setState({ imageMap });
  };

  goTo = (path, state) => {
    this.props.history.push(path);
  };

  handleThumbClick = ({ key, url }) => {
    console.log(url)
    const { stageWidth, imageMap } = this.state;
    if (key === "upload") {
      if (url) {
        this.goTo(`/photo/image-upload/clipping?imgUrl=${url}`);
      } else {
        // this.goTo("/photo/upload");
        window.location.href= "http://gold.dreamdeck.cn/photo/upload.html";
        //this.goTo("/photo/image-upload/clipping?imgUrl=http://gold.dreamdeck.cn/app/icons/gold/test.jpg")
      }

      this.saveStage();
      return;
    } else if (key === "resources") {
      this.goTo(`/photo/resources`);
      this.saveStage();
      return;
    }

    const imageKey = uid.get("image-");
    const imageWidth = stageWidth * 0.6;

    imageMap.set(imageKey, {
      x: stageWidth / 2,
      y: stageWidth / 2,
      maxWidth: imageWidth,
      maxHeight: imageWidth,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      src: url,
      uid: imageKey,
      index: this.index++
    });

    this.setState({ imageMap });
  };

  saveStage = (e, callback) => {
    this.setState({
      activeKey: ""
    });

    if (!this.stage) {
      return;
    }

    const stageJson = this.stage.getStage().toJSON();
    localforage.setItem("stageJson", stageJson).then(data => {
      callback && callback(data);
    });
  };

  handleTap = activeKey => {
    if (!/image/g.test(activeKey)) {
      this.setState({
        activeKey: ""
      });
      return;
    }

    this.state.activeKey = activeKey;
    this.updateImage({
      index: this.index++
    });
  };

  handlePressMove = e => {
    const { activeKey, imageMap, stageWidth } = this.state;

    if (!activeKey) {
      return;
    }

    const image = imageMap.get(activeKey);

    const x = Math.max(
      Math.min(stageWidth * 1.1, e.deltaX + image.x),
      stageWidth * -0.1
    );

    const y = Math.max(
      Math.min(stageWidth * 1.1, e.deltaY + image.y),
      stageWidth * -0.1
    );

    this.updateImage({
      x,
      y
    });
  };

  handlePinch = e => {
    const { activeKey, imageMap } = this.state;

    if (!activeKey) {
      return;
    }

    const image = imageMap.get(activeKey);
    const scale = Math.max(Math.min(2, image.initScale * e.scale), 0.5);

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

  changeImage = (key, props) => {
    const { imageMap } = this.state;
    const image = imageMap.get(key);
    imageMap.set(key, {
      ...image,
      ...props
    });
  };

  getSelectdProps = () => {
    const { imageMap, activeKey } = this.state;

    if (!activeKey) {
      return {};
    }

    const { x, y, scaleX, scaleY, width, height, rotation } = imageMap.get(
      activeKey
    );
    return {
      x,
      y,
      scaleX,
      scaleY,
      width,
      height,
      rotation
    };
  };

  onDelete = () => {
    const { imageMap, activeKey } = this.state;
    imageMap.delete(activeKey);
    this.setState({
      imageMap,
      activeKey: ""
    });
  };

  render() {
    const { imageMap, stageWidth, activeKey, thumbs } = this.state;
    const images = [...imageMap.values()].sort(
      (image1, image2) => image1.index - image2.index
    );

    return (
      <div className="page">
        <div className="body" style={s.body}>
          <div className="stage">
            <Transformer
              onMultipointStart={this.hanleMultipointStart}
              onPinch={this.handlePinch}
              onPressMove={this.handlePressMove}
              onRotate={this.handleRotate}
            >
              <Cropper
                style={{ backgroundColor: "#" + this.colorId }}
                stageRef={f => (this.stage = f)}
                width={stageWidth}
              >
                {images.length > 0 &&
                  images.map(image => {
                    const key = image.uid;
                    return /image|bg/.test(key) ? (
                      <Cropper.Image
                        onChange={props => this.changeImage(key, props)}
                        onTouchStart={e => this.handleTap(key)}
                        key={key}
                        {...image}
                        center
                      />
                    ) : (
                      <Cropper.Text
                        onTouchStart={e => this.handleTap(key)}
                        key={key}
                        {...image}
                      />
                    );
                  })}
                {activeKey ? (
                  <Cropper.Selected
                    {...this.getSelectdProps()}
                    onDelete={this.onDelete}
                  />
                ) : null}
              </Cropper>
            </Transformer>
          </div>
        </div>
        <Thumbs items={thumbs} onClick={this.handleThumbClick} />
        <Footer>
          <Footer.CancelIcon
            onClick={e => this.goTo("/photo?color=" + this.colorId)}
            //onClick={e => this.goTo("/photo/image-upload/clipping?imgUrl=http://gold.dreamdeck.cn/app/icons/gold/test.jpg")}
          />
          <Footer.Title>图片</Footer.Title>
          <Footer.OkIcon
            onClick={e =>
              this.saveStage(e, () => {
                this.goTo("/photo?color=" + this.colorId);
              })
            }
          />
        </Footer>
      </div>
    );
  }
}

const s = {
  body: {
    paddingBottom: "5rem",
    transition: ".2 all"
  }
};

export default EditorImage;
