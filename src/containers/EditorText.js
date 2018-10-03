import React, { Component } from "react";
import Footer from "../components/Footer";
import Cropper from "../components/Cropper";
import Transformer from "../components/Transformer";
import Prompt from "../components/Prompt";
import { uid } from "../utils";
import addTextUrl from "../assets/addText.png";

const colors = [
  "fff45c",
  "fde800",
  "ffcb15",
  "ffa921",
  "ff691f",
  "c53f46",
  "d6004a",
  "ff1d6b",
  "ff4da9",
  "ff80c5",
  "ffb4ce",
  "f043ec",
  "c92cc5",
  "ab1ea8",
  "ddf56d",
  "b0f346",
  "6fe113",
  "87c943",
  "129527",
  "059d7f",
  "5feacb",
  "30d6ce",
  "3c41dd",
  "00589c",
  "4676d9",
  "4e99df",
  "5faaff",
  "3abcff",
  "70d8ff",
  "7d65e9",
  "5e45cd",
  "ffffff",
  "cccccc",
  "999999",
  "666666",
  "333333",
  "000000"
].map(c => `#${c}`);

const fontFamilys = ["font1", "font2", "font3", "font4", "font6", "font5"];

const Add = ({ onClick }) => (
  <div className="add">
    <span onClick={onClick}>
      <img src={addTextUrl} alt="添加" />
    </span>
  </div>
);

const Colors = ({ onChange, value }) => (
  <div className="colors">
    <ul className="clearfix" style={{ width: `${colors.length}rem` }}>
      {colors.map(c => (
        <li
          key={c}
          onClick={e =>
            onChange({
              fill: c
            })
          }
          className={value === c ? "active" : null}
          style={{ background: c }}
        />
      ))}
    </ul>
  </div>
);

const Texts = ({ onChange, value }) => (
  <div className="texts">
    <ul className="clearfix" style={{ width: `${fontFamilys.length * 3}rem` }}>
      {fontFamilys.map((c, index) => (
        <li
          key={index + c}
          style={{
            fontFamily: c
          }}
          onClick={e =>
            onChange({
              fontFamily: c
            })
          }
          className={value === c ? "active" : null}
        >
          金魔方
        </li>
      ))}
    </ul>
  </div>
);

const Input = ({ onChange, value }) => (
  <div className="input">
    <input
      value={value}
      onChange={e =>
        onChange({
          text: e.target.value
        })
      }
      placeholder="点击输入文字"
    />
  </div>
);

const statusMap = {
  create: "添加文字",
  update: "编辑文字"
};

const defaultEditText = {
  text: "",
  fill: colors[0],
  fontFamily: fontFamilys[2]
};

class EditorText extends Component {
  state = {
    imageMap: new Map(),
    activeKey: "",
    stageWidth: 1,
    editText: {
      key: "",
      ...defaultEditText
    },
    textStatus: ""
  };

  index = 0;

  componentDidMount() {
    this.state.stageWidth = Math.min(window.innerWidth, 640) * 0.8;
    this.initStage();
  }

  initStage = () => {
    const { imageMap } = this.state;
    const stageJson = JSON.parse(window.localStorage.getItem("stageJson"));

    if (stageJson) {
      const images = stageJson.children[0].children;

      for (const { attrs } of images) {
        const key = attrs.uid;
        if (!/bg|image|text/g.test(key)) {
          break;
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

    this.setState({ imageMap });
  };

  goTo = path => {
    this.props.history.push(path);
  };

  createImage = () => {
    const { stageWidth, imageMap, editText } = this.state;

    const imageKey = uid.get("text-");

    imageMap.set(imageKey, {
      fill: editText.fill,
      text: editText.text,
      fontFamily: editText.fontFamily,
      x: stageWidth / 2,
      y: stageWidth / 2,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      uid: imageKey,
      index: this.index++
    });

    console.log(imageMap, "imageMap");

    this.setState({ imageMap, textStatus: "", editText: defaultEditText });
  };

  saveStage = (e, callback) => {
    this.setState({
      activeKey: ""
    });

    if (!this.stage) {
      return;
    }

    const timer = setTimeout(() => {
      clearTimeout(timer);
      const stageJson = this.stage.getStage().toJSON();
      window.localStorage.setItem("stageJson", stageJson);
      callback && callback(stageJson);
    }, 30);
  };

  handleTap = activeKey => {
    if (!/text/g.test(activeKey)) {
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

    console.log(width, "width");

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

  handleDbTap = () => {
    const { activeKey } = this.state;
    if (activeKey) {
      this.showTools(activeKey);
    }
  };

  showTools = textKey => {
    let textStatus = "create";

    let { editText, imageMap } = this.state;
    if (textKey) {
      const { text, fontFamily, color } = imageMap.get(textKey);
      textStatus = "update";
      editText = {
        text,
        fontFamily,
        color
      };
    }

    this.setState({ textStatus, editText });
  };

  onCancel = e => {
    const { textStatus } = this.state;
    if (!textStatus) {
      this.goTo("/");
    } else {
      this.setState({ textStatus: "" });
    }
  };

  onOk = e => {
    const { textStatus, editText, activeKey } = this.state;

    if (textStatus && !editText.text) {
      alert("请输入文字！");
      return;
    }

    if (textStatus === "create") {
      this.createImage();
    } else if (textStatus === "update") {
      this.updateImage(
        {
          ...editText
        },
        false
      );
      this.setState({
        textStatus: "",
        editText: defaultEditText
      });
    } else {
      this.saveStage(e, stageJson => {
        Prompt.message(<span>保存成功</span>);
      });
    }
  };

  onEditText = props => {
    const { editText } = this.state;
    this.setState({
      editText: {
        ...editText,
        ...props
      }
    });
  };

  render() {
    const {
      imageMap,
      stageWidth,
      activeKey,
      editText: { text, fill, fontFamily },
      updateKey,
      textStatus
    } = this.state;
    const images = [...imageMap.values()].sort(
      (image1, image2) => image1.index - image2.index
    );

    if (!images.length) {
      return <div className="page" />;
    }

    console.log(updateKey, "updateKey");

    return (
      <div className="page">
        <div className="body" style={s.body}>
          <div className="stage">
            <Transformer
              onMultipointStart={this.hanleMultipointStart}
              onPinch={this.handlePinch}
              onPressMove={this.handlePressMove}
              onRotate={this.handleRotate}
              onDoubleTap={this.handleDbTap}
            >
              <Cropper
                style={{ background: "#333" }}
                stageRef={f => (this.stage = f)}
                width={stageWidth}
              >
                {images.map(image => {
                  const key = image.uid;
                  return /image|bg/.test(key) ? (
                    <Cropper.Image
                      onTouchStart={e => this.handleTap(key)}
                      key={key}
                      {...image}
                      center
                    />
                  ) : (
                    <Cropper.Text
                      onChange={props => this.changeImage(key, props)}
                      onTouchStart={e => this.handleTap(key)}
                      key={key}
                      {...image}
                    />
                  );
                })}
                {activeKey ? (
                  <Cropper.Selected
                    id={updateKey}
                    onDelete={this.onDelete}
                    {...this.getSelectdProps()}
                  />
                ) : null}
              </Cropper>
            </Transformer>
            <Add onClick={e => this.showTools("")} />
          </div>
        </div>

        {textStatus && (
          <div className="text-root-mask">
            <div className="text-root">
              <Input onChange={this.onEditText} value={text} />
              <Colors onChange={this.onEditText} value={fill} />
              <Texts onChange={this.onEditText} value={fontFamily} />
              <Footer
                key={"footer-text"}
                style={{ background: "#000", zIndex: 1100 }}
              >
                <Footer.CancelIcon onClick={this.onCancel} />
                <Footer.Title>{statusMap[textStatus]}</Footer.Title>
                <Footer.OkIcon onClick={this.onOk} />
              </Footer>
            </div>
          </div>
        )}
        <Footer key={"footer"}>
          <Footer.CancelIcon onClick={this.onCancel} />
          <Footer.Title>文字</Footer.Title>
          <Footer.OkIcon onClick={this.onOk} />
        </Footer>
      </div>
    );
  }
}
const s = {
  body: {
    paddingBottom: "2.3rem",
    transition: ".2 all"
  }
};
export default EditorText;
