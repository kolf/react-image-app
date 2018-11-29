import React, { Component } from "react";
import localforage from "localforage";
import Footer from "../components/Footer";
import Cropper from "../components/Cropper";
import { uid } from "../utils";
import c1Url from "../assets/c1.png";
import c3Url from "../assets/c3.png";

const FooterItem = Footer.Item;

const footers = [
  {
    text: "阈值抠图",
    path: "/photo/image-upload/filter-clip",
    icon: c1Url
  },
  {
    text: "图割抠图",
    path: "/photo/image-upload/cut-clip",
    icon: c3Url
  }
];

class ClipHome extends Component {
  state = {
    imgUrl: "",
    stageWidth: 1
  };

  async componentDidMount() {
    const imgUrl = await localforage.getItem("imgUrl");
    const width = Math.min(window.innerWidth, 640);

    this.uid = uid.get("image-");

    this.setState({
      stageWidth: width * 0.8,
      imgUrl
    });
  }

  render() {
    const { imgUrl, stageWidth } = this.state;

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
                uid={this.uid}
              />
            </Cropper>
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

export default ClipHome;
