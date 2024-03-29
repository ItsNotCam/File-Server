import React, { Component } from "react";
import FileTable from "./components/FileTable";
import axios from "axios";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }

  render() {
    return <FileTable setCwd={cwd => this.setCwd(cwd)} />;
  }
}
