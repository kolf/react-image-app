import React, { Component } from "react";
import localforage from "localforage";
import axios from "axios";
import { dataURLToBlob } from "blob-util";
import Footer from "../components/Footer";
import Cropper from "../components/Cropper";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";

const FooterItem = Footer.Item1;

const bottons = [
  {
    text: "魔法棒",
    icon: img1
  },
  {
    text: "填充",
    icon: img2
  },
  {
    text: "橡皮擦",
    icon: img3
  }
];

//let index = 0;
const API_ROOT = "http://gold.dreamdeck.cn";

class CutClip extends Component {
  state = {
    stageWidth: 1,
    currentIndex: 0
  };

  async componentDidMount() {
    const imgUrl = await localforage.getItem("imgUrl");
    const width = Math.min(window.innerWidth, 640);

    this.setState({
      stageWidth: width * 0.8,
      imgUrl
    });
  }

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

  goTo = (path, state) => {
    this.props.history.push(path);
  };

  saveStage = () => {
    if (!this.drawingRef) {
      return;
    }

    this.upload(this.drawingRef.getResult(), imgUrl => {
      localforage.setItem("imgUrl", imgUrl).then(imgUrl => {
        this.goTo(`/photo/editor-image`);
      });
    });
  };

  startDrawWithNoPer = i => {
    //index = i;
    this.setState({ currentIndex: i });
    //console.log(index==i);
    //this.icon = c3Url;
    //let l = document.getElementByClassName('footer-item');
    //console.log(arguments[1]);
    this.drawingRef.changeDraw(i);
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
              pixelRatio={1}
            >
              <Cropper.Drawing
                src={imgUrl}
                maxWidth={stageWidth}
                maxHeight={stageWidth}
                imageRef={(ref, f) => (this.drawingRef = f)}
              />
            </Cropper>
          </div>
          <div className="buttons">
            {bottons.map((f, i) => (
              <FooterItem
                key={i}
                icon={f.icon}
                onClick={e => this.startDrawWithNoPer(i)}
                classname={
                  this.state.currentIndex == i
                    ? "action footer-item"
                    : "footer-item"
                }
              >
                {f.text}
              </FooterItem>
            ))}
          </div>
        </div>

        <Footer>
          <Footer.CancelIcon
            onClick={e => this.goTo(`/photo/image-upload/index`)}
          />
          <Footer.Title>图割抠图</Footer.Title>
          <Footer.OkIcon onClick={e => this.saveStage()} />
        </Footer>
      </div>
    );
  }
}

export default CutClip;
