import React, { Component } from "react";
import TableRow from "./TableRow";
import axios from "axios";
import ip from "../config/config";

const base_url = `http://${ip}/api`;
const web_url = `http://${ip}`;

export default class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: null,
      parent: null,
      childLoading: false,
      cwd: null
    };
  }

  componentDidMount = () => {
    this.updateFiles();
  };

  updateFiles = hash => {
    this.setState({ files: null });
    const url = `${base_url}/files` + (hash ? `/${hash}` : "");
    axios
      .get(url, {
        headers: ["Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"]
      })
      .then(res => res.data)
      .then(data => {
        this.setState({
          files: data.files,
          parent: data.parent,
          cwd: data.cwd
        });
      })
      .catch(err => console.log(err.response));
  };

  updateName = (hash, name, callback) => {
    if (this.state.childLoading) {
      callback(400, "Wait until current operation is completed");
      return;
    }

    this.setState({
      childLoading: true
    });

    // make statement here
    const url = `${base_url}/file/${hash}/rename?name=${name}`;
    console.log(url);
    axios
      .put(url, {
        headers: ["Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"]
      })
      .then(res => res.data)
      .then(data => {
        var files = this.state.files;
        for (var i = 0; i < files.length; i++) {
          var file = this.state.files[i];
          if (file.hash === hash) {
            files[i].filename = data.new_name + files[i].extension;
            files[i].name = data.new_name;
            files[i].hash = data.new_hash;
            return callback(200, "");
          }
        }
      })
      .catch(err => {
        console.log(err.response);
        callback(
          400,
          err.response.data ? err.response.data.message : err.message
        );
      })
      .finally(() => this.setState({ childLoading: false }));
  };

  zipFile = (name, hash, callback) => {
    if (this.state.childLoading) {
      callback(400, "Wait until current operation is completed");
      return;
    }

    this.setState({
      childLoading: true
    });

    const tmpFile = {
      name: `${name}.zip`,
      extension: ".zip",
      loading: true,
      filename: `${name}.zip`,
      parent: "",
      is_dir: false,
      hash: "tmpHash"
    };

    let index;
    var files = this.state.files;
    for (var i = 0; i < files.length; i++) {
      if (!files[i].is_dir || i + 1 === files.length) {
        index = i;
        files.splice(index, 0, tmpFile);
        this.setState({ files: files });
        break;
      }
    }

    axios
      .post(`${base_url}/file/${hash}/zip`, {
        headers: ["Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"]
      })
      .then(res => {
        console.log(res);
        console.log(res.data.file);

        files[index] = res.data.file;
        this.setState({ files: files });

        callback(200, "");
      })
      .catch(err => {
        console.log(err.response);
        files.splice(index, 1);
        this.setState({
          files: files
        });
        callback(400, err.response.data.message);
      })
      .finally(() => this.setState({ childLoading: false }));
  };

  unzipFile = (name, hash, callback) => {
    if (this.state.childLoading) {
      callback(400, "Wait until current operation is completed");
      return;
    }

    this.setState({
      childLoading: true
    });

    const tmpFile = {
      name: name,
      extension: "",
      loading: true,
      filename: name,
      parent: "",
      is_dir: true,
      hash: "tmpHash"
    };

    let index;
    var files = this.state.files;
    for (var i = 0; i < files.length; i++) {
      if (!files[i].is_dir) {
        index = i + 1;
        files.splice(index, 0, tmpFile);
        this.setState({ files: files });
        break;
      }
    }

    axios
      .post(`${base_url}/file/${hash}/unzip`, {
        headers: ["Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"]
      })
      .then(res => {
        files[index] = res.data.file;
        this.setState({ files: files });

        callback(200, "");
      })
      .catch(err => {
        files.splice(index, 1);
        this.setState({
          files: files
        });
        callback(400, err.response.data.message);
      })
      .finally(() => this.setState({ childLoading: false }));
  };

  downloadFile = (hash, callback) => {
    const link = document.createElement("a");
    link.href = `${base_url}/file/${hash}/download`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    callback();
  };

  changeDir = hash => {
    if (hash === null || this.state.childLoading) return;

    const url = `${web_url}/chgdir/${hash}`;
    axios
      .get(url, {
        headers: ["Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"]
      })
      .then(res => res.data)
      .then(data => {
        this.setState({
          files: data.files,
          parent: data.parent,
          cwd: data.cwd
        });
        this.props.setCwd(data.cwd);
      })
      .catch(err => console.log(err.response));
  };

  deleteFile = (hash, dir) => {
    if (hash === null || this.state.childLoading) return;

    this.setState({
      files: this.state.files.filter(file => file.hash !== hash),
      childLoading: true
    });
    axios
      .delete(`${base_url}/file/${hash}`, {
        headers: ["Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"]
      })
      .then(
        this.setState({
          files: this.state.files.filter(file => file.hash !== hash)
        })
      )
      .catch(err => console.log(err.response))
      .finally(() => this.setState({ childLoading: false }));
  };

  uploadFile = e => {
    if (this.state.childLoading) return;

    let formData = new FormData();
    formData.append("file", e.target.files[0]);

    var name = e.target.files[0].name;
    const extension = name.substring(name.lastIndexOf("."));
    const filename = name.substring(0, name.lastIndexOf("."));

    var tmpFile = {
      name: e.target.files[0].name,
      extension: extension,
      loading: true,
      filename: name,
      parent: "",
      is_dir: false,
      hash: "tmpHash"
    };

    const index = this.state.files.length - 1;
    var files = this.state.files;
    files.splice(index, 0, tmpFile),
      this.setState({
        files: files,
        childLoading: true
      });

    axios
      .post(`http://${ip}/api/file/${this.state.cwd}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(res => res.data)
      .then(data => {
        tmpFile = {
          name: data.file.name,
          extension: data.file.extension,
          loading: false,
          filename: data.file.filename,
          parent: data.file.parent,
          is_dir: false,
          hash: data.file.hash
        };

        files[index] = tmpFile;
        this.setState({
          childLoading: false,
          files: files
        });
      })
      .catch(err => {
        console.log(err);
        files.splice(index, 1);
        this.setState({
          files: files,
          childLoading: false
        });
      })
      .finally(() => this.setState({ childLoading: false }));
  };

  render() {
    const TableHead = (
      <thead style={{ background: "rgba(160,175,252,0.5)" }}>
        <tr>
          <th style={{ width: 20 }}></th>
          <th
            style={{
              width: "50%",
              verticalAlign: "middle"
            }}
          >
            <h4 style={{ padding: 0, margin: 0 }}>Filename</h4>
          </th>
          <th colspan="3">
            <div class="input-group">
              <input
                type="file"
                className="custom-file-input bg-primary"
                id="inputGroupFile01"
                aria-describedby="inputGroupFileAddon01"
                onChange={this.uploadFile}
              />
              <label
                className="custom-file-label bg-dark"
                for="inputGroupFile01"
              >
                Upload File
              </label>
            </div>
          </th>
        </tr>
      </thead>
    );

    const headerFile = {
      filename: ".....",
      name: ".....",
      go_back: true
    };

    return (
      <table className="table table-hover bg-table">
        {TableHead}
        {this.state.files !== null ? (
          <tbody>
            <TableRow
              file={headerFile}
              changeDir={() => this.changeDir(this.state.parent)}
            />
            {this.state.files.map(file => (
              <TableRow
                key={file.hash}
                file={file}
                updateName={(name, callback) =>
                  this.updateName(file.hash, name, callback)
                }
                zipFile={callback =>
                  this.zipFile(file.name, file.hash, callback)
                }
                unzipFile={callback =>
                  this.unzipFile(file.name, file.hash, callback)
                }
                downloadFile={callback =>
                  this.downloadFile(file.hash, callback)
                }
                changeDir={() => this.changeDir(file.hash)}
                deleteFile={() => this.deleteFile(file.hash, file.parent)}
              />
            ))}
          </tbody>
        ) : (
          "LOADING"
        )}
      </table>
    );
  }
}
