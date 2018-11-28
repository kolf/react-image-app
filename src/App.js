import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

import Home from "./containers/Home";
import EditorImage from "./containers/EditorImage";
import EditorText from "./containers/EditorText";
import Clipping from "./containers/Clipping";
import ClipHome from "./containers/ClipHome";
import FilterClip from "./containers/FilterClip";
import CutClip from "./containers/CutClip";
import Resources from "./containers/Resources";
import Success from "./containers/Success";
import Upload from "./containers/Upload";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/photo" component={Home} />
            <Route exact path="/photo/editor-image" component={EditorImage} />
            <Route exact path="/photo/editor-text" component={EditorText} />
            <Route exact path="/photo/image-upload/clipping" component={Clipping} />
            <Route exact path="/photo/image-upload/index" component={ClipHome} />
            <Route exact path="/photo/image-upload/filter-clip" component={FilterClip} />
            <Route exact path="/photo/image-upload/cut-clip" component={CutClip} />
            <Route exact path="/photo/resources" component={Resources} />
            <Route exact path="/photo/success" component={Success} />
            <Route exact path="/photo/upload" component={Upload} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
