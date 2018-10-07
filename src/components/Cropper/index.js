import React, { Component } from "react";
import { Stage, Layer, Image, Text, Group, Rect } from "react-konva";
import { resizeImage, fromURI, loadImage } from "./utils";

import removeIcon from "./remove.png";

class Drawing extends Component {
  state = {
    isDrawing: false,
    width: 1,
    height: 1,
    image: new window.Image()
  };

  bitmap = null;
  maskBitmap = null;
  sampleColors = {};
  paths = [];
  // eraser = { path: [], down: false, sampleColors: {} };

  componentDidMount() {
    const { maxHeight, maxWidth, src } = this.props;
    fromURI(src, (error, image) => {
      this.imageRef.getLayer().batchDraw();
      const canvas = document.createElement("canvas");
      const tempCanvas = document.createElement("canvas");
      const maskCanvas = document.createElement("canvas");

      const { width, height } =
        maxWidth && maxHeight
          ? resizeImage(image.width, image.height, maxWidth, maxHeight)
          : this.props;

      maskCanvas.width = tempCanvas.width = canvas.width = width;
      maskCanvas.height = tempCanvas.height = canvas.height = height;

      const context = canvas.getContext("2d");
      const tempCtx = tempCanvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");

      tempCtx.drawImage(image, 0, 0, width, height);

      this.bitmap = tempCtx.getImageData(0, 0, width, height);
      this.maskBitmap = maskCtx.getImageData(0, 0, width, height);
      this.setState({ canvas, context, width, height, image });
    });
  }

  handleMouseDown = () => {
    const { context } = this.state;
    this.setState({ isDrawing: true });
    const stage = this.imageRef.getStage();
    this.lastPointerPosition = stage.getPointerPosition();
    this.paths = [];
    this.sampleColors = {};
    context.restore();
    this.imageRef.getLayer().draw();
  };

  handleMouseUp = () => {
    const { isDrawing, width, height, context } = this.state;
    if (isDrawing) {
      context.clearRect(0, 0, width, height);
      this.imageRef.getLayer().draw();
      this.pervade();
      this.paths = [];
    }
    this.setState({ isDrawing: false });
  };

  handleMouseMove = ({ evt }) => {
    const { context, isDrawing } = this.state;

    if (evt.buttons === 1) {
      // draw
      context.globalCompositeOperation = "source-over";
    } else if (evt.buttons === 2) {
      // erase
      context.globalCompositeOperation = "destination-out";
    }

    if (isDrawing) {
      context.strokeStyle = "#ffffff";
      context.lineJoin = "round";
      context.lineWidth = 10;

      if (evt.buttons === 1) {
        // draw
        context.globalCompositeOperation = "source-over";
      } else if (evt.buttons === 2) {
        // erase
        context.globalCompositeOperation = "destination-out";
      }
      context.beginPath();

      let localPos = {
        x: parseInt(this.lastPointerPosition.x - this.imageRef.x()),
        y: parseInt(this.lastPointerPosition.y - this.imageRef.y())
      };

      this.paths.push(localPos);
      const color = this.getColor(localPos);
      color.x = localPos.x;
      color.y = localPos.y;
      this.sampleColors[`c${color.rgb}`] = color;

      context.moveTo(localPos.x, localPos.y);

      const stage = this.imageRef.getStage();
      const pos = stage.getPointerPosition();
      localPos = {
        x: parseInt(pos.x - this.imageRef.x()),
        y: parseInt(pos.y - this.imageRef.y())
      };

      context.lineTo(localPos.x, localPos.y);
      context.closePath();
      context.stroke();
      this.lastPointerPosition = pos;
      this.imageRef.getLayer().draw();
    }
  };

  pervade = () => {
    const { width, height } = this.state;

    // 先对采样的颜色进行排序
    let s = null;
    const colors = [];

    for (const j in this.sampleColors) {
      if (s === null) s = this.sampleColors[j];
      colors.push(this.sampleColors[j]);
    }
    colors.sort((a, b) => {
      const x = Math.sqrt(
        Math.pow(255 - a.r, 2) + Math.pow(255 - a.g, 2) + Math.pow(255 - a.b, 2)
      );
      const y = Math.sqrt(
        Math.pow(255 - b.r, 2) + Math.pow(255 - b.g, 2) + Math.pow(255 - b.b, 2)
      );
      return x - y;
    });

    this.sampleColors = colors;

    console.log(this.sampleColors);
    // 从任意一点开始扩张，将相似区域的颜色先全部替换成红色看看
    const paths = [s];
    do {
      s = paths.pop();
      if (s === null) break;
      const index = (width * s.y + s.x) * 4;
      const red = this.bitmap.data[index];
      const green = this.bitmap.data[index + 1];
      const blue = this.bitmap.data[index + 2];
      const alpha = this.bitmap.data[index + 3];

      // 是否己经探查过了？使用ALPHA通道进行标记，0xfa表示己经探查过了
      if (alpha === 0xfa) continue;
      this.bitmap.data[index + 3] = 0xfa;

      // 如果当前点的颜色不在采样颜色表内，则跳过该点
      if (this.colorMatches(red, green, blue, 24) > 24) continue;
      this.maskBitmap.data[index] = 0xff;
      this.maskBitmap.data[index + 1] = 0x00;
      this.maskBitmap.data[index + 2] = 0x00;
      this.maskBitmap.data[index + 3] = 0xa0;

      // TODO: 有些情况下渗透不到位，待查
      let top = null,
        left = null,
        right = null,
        bottom = null;
      if (s.x > 0) {
        const d = { x: s.x - 1, y: s.y };
        const idx = (width * d.y + d.x) * 4;
        if (this.bitmap.data[idx + 3] === 0xff) left = d;
      }
      if (s.y > 0) {
        const d = { x: s.x, y: s.y - 1 };
        const idx = (width * d.y + d.x) * 4;
        if (this.bitmap.data[idx + 3] === 0xff) top = d;
      }
      if (s.x < width) {
        const d = { x: s.x + 1, y: s.y };
        const idx = (width * d.y + d.x) * 4;
        if (this.bitmap.data[idx + 3] === 0xff) right = d;
      }
      if (s.y < height) {
        const d = { x: s.x, y: s.y + 1 };
        const idx = (width * d.y + d.x) * 4;
        if (this.bitmap.data[idx + 3] === 0xff) bottom = d;
      }

      // 记录路径
      if (left) paths.push(left);
      if (top) paths.push(top);
      if (right) paths.push(right);
      if (bottom) paths.push(bottom);

      // console.log(paths, "paths");
    } while (paths.length > 0);

    // 输出显示一下看看
    const { context } = this.state;
    context.putImageData(this.maskBitmap, 0, 0);
    this.imageRef.getLayer().draw();
  };

  getColor = ({ x, y }) => {
    if (!x || !y) return null;
    const index = (y * this.bitmap.width + x) * 4;
    const red = this.bitmap.data[index];
    const green = this.bitmap.data[index + 1];
    const blue = this.bitmap.data[index + 2];
    const alpha = this.bitmap.data[index + 3];
    return {
      r: red,
      g: green,
      b: blue,
      a: alpha,
      rgb: (red << 16) | (green << 8) | blue
    };
  };

  colorMatches = (r, g, b, min) => {
    let start = 0;
    let end = this.sampleColors.length;

    for (let i = 0; i < this.sampleColors.length; i++) {
      const mid = parseInt(start + (end - start) / 2);
      const left = parseInt(start + (mid - start) / 2);
      const right = parseInt(mid + (end - mid) / 2);

      const ldiff = this.colorDiff(
        r,
        g,
        b,
        this.sampleColors[left].r,
        this.sampleColors[left].g,
        this.sampleColors[left].b
      );
      const rdiff = this.colorDiff(
        r,
        g,
        b,
        this.sampleColors[right].r,
        this.sampleColors[right].g,
        this.sampleColors[right].b
      );
      if (ldiff < min) return ldiff;
      if (rdiff < min) return rdiff;
      if (ldiff < rdiff) {
        end = right;
      } else {
        start = left;
      }
    }
    return Number.MAX_VALUE;
  };

  colorDiff = (x, y, z, r, g, b) =>
    Math.sqrt(Math.pow(x - r, 2) + Math.pow(y - g, 2) + Math.pow(z - b, 2));

  getResult = () => {
    const { width, height } = this.state;
    const length = this.bitmap.data.length;
    for (let i = 0; i < length; i += 4) {
      // console.log(this.maskBitmap.data[i]);
      if (this.maskBitmap.data[i] === 0) {
        this.bitmap.data[i] = 0x00;
        this.bitmap.data[i + 1] = 0x00;
        this.bitmap.data[i + 2] = 0x00;
        this.bitmap.data[i + 3] = 0x00;
      }
    }

    const result = document.createElement("canvas");
    const resultCtx = result.getContext("2d");
    result.width = width;
    result.height = height;
    resultCtx.putImageData(this.bitmap, 0, 0);

    return result;
  };

  render() {
    const { imageRef } = this.props;
    const { canvas, width, height, image } = this.state;

    return (
      <Group width={width} height={height}>
        <Image image={image} width={width} height={height} />
        <Image
          image={canvas}
          ref={f => {
            this.imageRef = f;
            imageRef && imageRef(f, this);
          }}
          width={width}
          height={height}
          onTouchStart={this.handleMouseDown}
          onTouchEnd={this.handleMouseUp}
          onTouchMove={this.handleMouseMove}
        />
      </Group>
    );
  }
}

class XImage extends Component {
  state = {
    image: new window.Image(),
    width: this.props.width || 1,
    height: this.props.height || 1
  };

  componentDidMount() {
    const { maxHeight, maxWidth, onChange, src } = this.props;

    const crossOrigin = /^http/.test(src);
    loadImage(src, crossOrigin).then(image => {
      this.imageRef.getLayer().batchDraw();
      const { width, height } =
        maxWidth && maxHeight
          ? resizeImage(image.width, image.height, maxWidth, maxHeight)
          : this.props;
      this.setState({
        image,
        width,
        height
      });

      onChange &&
        onChange({
          width,
          height
        });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { width, height, image } = this.state;

    if (
      width !== nextProps.width ||
      height !== nextProps.height ||
      this.props.maxWidth < width ||
      this.props.maxHeight < height
    ) {
      this.setState({
        ...resizeImage(
          image.width,
          image.height,
          nextProps.maxWidth,
          nextProps.maxHeight
        )
      });
    }
  }

  render() {
    const { center, imageRef } = this.props;
    const { width, height } = this.state;

    return (
      <Image
        {...this.props}
        height={height}
        width={width}
        offset={
          center
            ? {
                x: width / 2,
                y: height / 2
              }
            : undefined
        }
        image={this.state.image}
        ref={f => {
          this.imageRef = f;
          imageRef && imageRef(f);
        }}
      />
    );
  }
}

class XText extends Component {
  state = {
    width: 1,
    height: 1
  };

  componentDidMount() {
    this.setRect();
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.text !== nextProps.text ||
      this.props.fontFamily !== nextProps.fontFamily ||
      this.state.width !== nextProps.width
    ) {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        this.setRect();
      }, 30);
    }
  }

  setRect = () => {
    const { onChange } = this.props;
    const { textHeight, textWidth } = this.textRef;
    const newHeight = textHeight + 6;
    const newWidth = textWidth + 10;

    this.setState({
      width: newWidth,
      height: newHeight
    });

    console.log(this.textRef.parent, "this.textRef");

    onChange &&
      onChange({
        width: newWidth,
        height: newHeight
      });
  };

  render() {
    const { text, fill, fontFamily, textRef } = this.props;
    const { width, height } = this.state;

    const groupProps = {
      ...this.props,
      offset: {
        x: width / 2,
        y: height / 2
      }
    };

    const textProps = {
      fontFamily,
      fontSize: 24,
      text,
      fill,
      x: 5,
      y: 3,
      ref: f => {
        this.textRef = f;
        textRef && textRef(f);
      }
    };

    return (
      <Group {...groupProps}>
        <Text {...textProps} />
      </Group>
    );
  }
}

class Clipping extends Component {
  state = {};

  componentDidMount() {
    const { width, height } = this.props;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height || width;
    const context = canvas.getContext("2d");

    this.setState({ canvas, context }, () => {
      this.renderCover();
    });
  }

  renderCover = () => {
    const { width, height, stageWidth, stageHeight } = this.props;
    const { context } = this.state;

    context.save();
    context.fillStyle = "black";
    context.globalAlpha = 0.7;
    context.fillRect(0, 0, width, height);
    context.restore();
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.rect(
      width / 2 - stageWidth / 2,
      height / 2 - stageHeight / 2,
      stageWidth,
      stageHeight
    );

    context.fill();
    context.restore();
    context.save();
    context.beginPath();
    context.strokeStyle = "#dec6a7";
    context.strokeWidth = 2;
    context.rect(
      width / 2 - stageWidth / 2,
      height / 2 - stageHeight / 2,
      stageWidth,
      stageHeight
    );

    context.stroke();

    this.imageRef.getLayer().draw();
  };

  render() {
    const { width, height, imageRef } = this.props;
    const { canvas } = this.state;

    return (
      <Image
        image={canvas}
        ref={node => {
          this.image = node;
          imageRef && imageRef(node);
        }}
        width={width}
        height={height || width}
      />
    );
  }
}

class Selected extends Component {
  render() {
    const {
      x,
      y,
      scaleX = 1,
      scaleY = 1,
      width,
      height,
      rotation,
      onDelete
    } = this.props;

    const groupProps = {
      width: width * scaleX,
      height: height * scaleY,
      x,
      y,
      offset: {
        x: (width * scaleX) / 2,
        y: (height * scaleY) / 2
      },
      rotation
    };

    const borderProps = {
      width: width * scaleX,
      height: height * scaleY,
      strokeWidth: 2,
      stroke: "#ffffff"
    };

    const removeProps = {
      width: 26,
      height: 26,
      center: true,
      onTap: onDelete,
      src: removeIcon
    };

    return (
      <Group {...groupProps}>
        <Rect {...borderProps} />
        {onDelete && <XImage {...removeProps} />}
      </Group>
    );
  }
}

class Cropper extends Component {
  render() {
    const { children, width, height, stageRef } = this.props;
    const stageProps = {
      ...this.props,
      height: height || width,
      ref: f => {
        this.stage = f;
        stageRef && stageRef(f);
      }
    };

    return (
      <Stage {...stageProps}>
        <Layer>{children}</Layer>
      </Stage>
    );
  }
}

Cropper.Image = XImage;
Cropper.Text = XText;
Cropper.Drawing = Drawing;
Cropper.Clipping = Clipping;
Cropper.Selected = Selected;

export default Cropper;
