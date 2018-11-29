import React, { Component, version } from "react";
import axios from "axios";
import { withStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import tileData from "../mock/tileData";
import localforage from "localforage";
import { uid, isWindow } from "../utils";

const API_ROOT = "http://gold.dreamdeck.cn";
const s = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    backgroundColor: theme.palette.background.paper
  },
  gridList: {
    width: "100%",
    padding: "55px 0 0 0"
  }
});

class Resource extends Component {
  state = {
    thumbs: [],
    cellHeight: 160,
    imageMap: new Map(),
  };

  componentDidMount() {
    const cellHeight = window.innerWidth / 3;
    console.log(cellHeight)
    this.setState({
      cellHeight
    });
    this.loadThumbs();
  }

  loadThumbs = async () => {
    const thumbs = await axios
      .get(`${API_ROOT}/mc/base/read/v1/base/icon/list`)
      .then(res =>
        res.data.object.baseIconList.map(item => ({
          url: `${API_ROOT}/app/icons${item.iconPath}`,
          key: item.iconId,
          title: item.iconName
        }))
      );
    console.log(thumbs)
    this.setState({
      thumbs
    });
  };
  goTo = (path, state) => {
    this.props.history.push(path);
  };

  handleThumbClick = (imgUrl) => {
    localforage.setItem("resImgUrl", imgUrl).then(v => {
      this.goTo(`/photo/editor-image`);
    });
  };




  render() {
    const { classes } = this.props;
    const { thumbs,cellHeight } = this.state;

    return (
      <div className="page">
        <div className={classes.root}>
          <span className="fanhui" onClick={e => this.handleThumbClick()}>返回</span>
          <div className="title">大师图库</div>
          <GridList
            cellHeight={cellHeight}
            className={classes.gridList}
            cols={3}
          >
            {thumbs.map(tile => (
              <GridListTile key={tile.key} cols={1}>
                <img src={tile.url} alt={tile.title} onClick={e => this.handleThumbClick(tile.url)}/>
              </GridListTile>
            ))}
          </GridList>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Resource);
