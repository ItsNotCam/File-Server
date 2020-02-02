import React, { Component } from "react";
import { SwapSpinner } from "react-spinners-kit";

const renderIcon = file => {
  const image = [".jpg", ".jpeg", ".png", ".tif", ".gif"];
  const code = [".sh", ".js", ".py", ".html", ".css"];
  const archive = [".zip", ".rar", ".xz", ".tar", ".gz"];
  const audio = [".mp3", ".wav"];
  const text = [".txt", ".doc", ".docx"];
  const pdf = ".pdf";

  let iconClass;
  if (file.go_back) iconClass = "fa fa-folder text-warning fa-lg";
  else if (code.indexOf(file.extension) >= 0)
    iconClass = "fa fa-code fa-lg code-color";
  else if (text.indexOf(file.extension) >= 0)
    iconClass = "fa fa-align-left fa-lg";
  else if (image.indexOf(file.extension) >= 0)
    iconClass = "fa fa-camera-retro fa-lg photo-color";
  else if (archive.indexOf(file.extension) >= 0)
    iconClass = "fa fa-archive fa-lg archive-color";
  else if (audio.indexOf(file.extension) >= 0)
    iconClass = "fa fa-file-audio fa-lg text-success";
  else if (file.extension === pdf)
    iconClass = "fa fa-file-pdf fa-lg text-success";
  else if (file.is_dir) iconClass = "fa fa-folder text-info fa-lg";
  else iconClass = "fa fa-file text-success fa-lg";

  return <i className={iconClass} />;
};

export default class TableRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      loading: props.file.loading ? props.file.loading : false,
      actionSuccess: null,
      errMsg: ""
    };
  }

  actionCallback = (status, msg) => {
    this.setState({
      loading: false,
      actionSuccess: status === 200,
      errMsg: msg
    });

    const timeout_length = status === 200 ? 400 : 1500;
    setTimeout(() => {
      this.setState({ actionSuccess: null, errMsg: "" });
    }, timeout_length);
  };

  updateName = e => {
    e.preventDefault();
    const { name, hash } = this.props.file;

    const newName = document.getElementById(`updatefn-${hash}`).value;
    if (name === newName) {
      this.setState({ editing: false });
      return;
    }

    this.setState({
      editing: false,
      loading: true
    });

    this.props.updateName(newName, (status, msg) =>
      this.actionCallback(status, msg)
    );
  };

  zipFile = () => {
    this.props.zipFile((status, msg) => this.actionCallback(status, msg));
  };

  unzipFile = () => {
    this.props.unzipFile((status, msg) => this.actionCallback(status, msg));
  };

  downloadFile = () => {
    this.setState({
      loading: true
    });
    this.props.downloadFile(() => this.setState({ loading: false }));
  };

  renderFilename = () => {
    const { name, filename, is_dir, hash, extension } = this.props.file;
    return this.state.editing ? (
      <form onSubmit={this.updateName} style={{ maxHeight: 10, marginTop: -5 }}>
        <div className="row">
          <div className="col">
            <input
              id={`updatefn-${hash}`}
              type="text"
              className="form-control bg-dark text-white form-control-sm"
              defaultValue={name}
            />
          </div>
          <div className="col-4">
            <button
              type="button"
              className="btn bg-success"
              onClick={this.updateName}
              style={{ marginRight: 10 }}
            >
              <i className="fa fa-check" />
            </button>
            <button
              type="button"
              className="btn bg-primary text-white"
              onClick={() => this.setState({ editing: false })}
            >
              <i className="fa fa-undo" />
            </button>
          </div>
        </div>
      </form>
    ) : is_dir ? (
      `${filename}/`
    ) : (
      <span onClick={() => this.setState({ editing: false })}>{filename}</span>
    );
  };

  render() {
    const { name, is_dir, extension, filename } = this.props.file;

    if (this.props.file.go_back) {
      return (
        <tr>
          <td>{renderIcon(this.props.file)}</td>
          <td>{name}</td>
          <td className="text-warning action" onClick={this.props.changeDir} colspan="3">
            Go Back
          </td>
        </tr>
      );
    }

    if (this.state.actionSuccess === true) {
      return (
        <tr>
          <td>
            <i className="fa fa-check text-success fa-lg" />
          </td>
          <td className="text-success">Success!</td>
          <td className="text-secondary action">
            {is_dir ? "Enter" : "Download"}
          </td>
          <td className="text-secondary action">
            {is_dir ? "Zip" : extension === ".zip" ? "Unzip" : ""}
          </td>
          <td className="text-secondary action">Delete</td>
        </tr>
      );
    }

    if (this.state.actionSuccess === false) {
      return (
        <tr>
          <td>
            <i className="fa fa-times text-danger fa-lg" />
          </td>
          <td className="text-danger">{this.state.errMsg}!</td>
          <td className="text-secondary action">
            {is_dir ? "Enter" : "Download"}
          </td>
          <td className="text-secondary action">
            {is_dir ? "Zip" : extension === ".zip" ? "Unzip" : ""}
          </td>
          <td className="text-secondary action">Delete</td>
        </tr>
      );
    }

    if (this.state.loading) {
      return (
        <tr>
          <td>
            <SwapSpinner size={21} color={"#61c9a8"} />
          </td>
          <td className="text-secondary">{filename + (is_dir ? "/" : "")}</td>
          <td className="text-secondary action">
            {is_dir ? "Enter" : "Download"}
          </td>
          <td className="text-secondary action">
            {is_dir ? "Zip" : extension === ".zip" ? "Unzip" : ""}
          </td>
          <td className="text-secondary action">Delete</td>
        </tr>
      );
    }

    return (
      <tr>
        <td>{renderIcon(this.props.file)}</td>
        <td
          onClick={() => {
            if (!this.state.editing) this.setState({ editing: true });
          }}
        >
          {this.renderFilename()}
        </td>
        {is_dir ? (
          <>
            <td className="text-info action" onClick={this.props.changeDir}>
              Enter
            </td>
            <td className="code-color action" onClick={this.zipFile}>
              Zip
            </td>
          </>
        ) : [".zip"].indexOf(extension) > -1 ? (
          <>
            <td className="text-info action" onClick={this.downloadFile}>
              Download
            </td>
            <td className="code-color action" onClick={this.unzipFile}>
              Unzip
            </td>
          </>
        ) : (
          <>
            <td className="text-info action" onClick={this.downloadFile}>Download</td>
            <td className="code-color action"></td>
          </>
        )}
        <td className="text-danger action" onClick={this.props.deleteFile}>
          Delete
        </td>
      </tr>
    );
  }
}
