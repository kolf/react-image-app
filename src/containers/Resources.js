import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import tileData from "mock/tileData";

const s = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper
  },
  gridList: {
    width: "100%"
  }
});

class Resource extends Component {
  state = {
    cellHeight: 160
  };

  componentDidMount() {
    const cellHeight = window.innerWidth / 3;
    this.setState({
      cellHeight
    });
  }

  render() {
    const { classes } = this.props;
    const { cellHeight } = this.state;

    return (
      <div className="page">
        <div className={classes.root}>
          <GridList
            cellHeight={cellHeight}
            className={classes.gridList}
            cols={3}
          >
            {tileData.map(tile => (
              <GridListTile key={tile.img} cols={tile.cols || 1}>
                <img src={tile.img} alt={tile.title} />
              </GridListTile>
            ))}
          </GridList>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Resource);
