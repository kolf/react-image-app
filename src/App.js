import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./containers/Home";
import EditorImage from "./containers/EditorImage";
import EditorText from "./containers/EditorText";
import Clipping from "./containers/Clipping";
import ClipHome from "./containers/ClipHome";
import FilterClip from "./containers/FilterClip";
import CutClip from "./containers/CutClip";
import Success from "./containers/Success";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path="/photo/" component={Home} />
          <Route exact path="/photo/editor-image" component={EditorImage} />
          <Route exact path="/photo/editor-text" component={EditorText} />
          <Route
            exact
            path="/photo/image-upload/clipping"
            component={Clipping}
          />
          <Route exact path="/photo/image-upload/index" component={ClipHome} />
          <Route
            exact
            path="/photo/image-upload/filter-clip"
            component={FilterClip}
          />
          <Route
            exact
            path="/photo/image-upload/cut-clip"
            component={CutClip}
          />
          <Route exact path="/photo/success" component={Success} />
        </div>
      </Router>
    );
  }
}

export default App;
