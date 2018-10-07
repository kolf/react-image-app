import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./containers/Home";
import EditorImage from "./containers/EditorImage";
import EditorText from "./containers/EditorText";
import Clipping from "./containers/Clipping";
import ClipHome from "./containers/ClipHome";
import FilterClip from "./containers/FilterClip";
import CutClip from "./containers/CutClip";
class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path="/" component={Home} />
          <Route exact path="/editor-image" component={EditorImage} />
          <Route exact path="/editor-text" component={EditorText} />
          <Route exact path="/image-upload/clipping" component={Clipping} />
          <Route exact path="/image-upload/index" component={ClipHome} />
          <Route
            exact
            path="/image-upload/filter-clip"
            component={FilterClip}
          />
          <Route exact path="/image-upload/cut-clip" component={CutClip} />
        </div>
      </Router>
    );
  }
}

export default App;
