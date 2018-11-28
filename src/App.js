import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "./containers/Home";
import EditorImage from "./containers/EditorImage";
import EditorText from "./containers/EditorText";
import Clipping from "./containers/Clipping";
import ClipHome from "./containers/ClipHome";
import FilterClip from "./containers/FilterClip";
import CutClip from "./containers/CutClip";
import Test from "./containers/Test";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/photo/editor-image" component={EditorImage} />
            <Route path="/photo/editor-text" component={EditorText} />
            <Route path="/photo/image-upload/clipping" component={Clipping} />
            <Route path="/photo/image-upload/index" component={ClipHome} />
            <Route
              path="/photo/image-upload/filter-clip"
              component={FilterClip}
            />
            <Route path="/photo/image-upload/cut-clip" component={CutClip} />
            <Route path="/test" component={Test} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
