import React, { Component } from 'react';
import { tracksForSong } from './../../api/phishin';
import { sortByOptions, trackJamcharts, songFilters  } from './../../filterOptions';
import Ionicon from 'react-ionicons';
import Select from 'react-select';
import Filter from './Filter';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css'
import './../../css/Shows.css';
import 'react-select/dist/react-select.css';

const isJamchart = (id) => {
  return (trackJamcharts.indexOf(id) !== -1);
}

const msToSec = (time) => {
  var minutes = Math.floor(time / 60000);
  var seconds = ((time % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

export default class Songs extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      tracks: null,
      filterOption: '',
      loadingShows: false,
      songSearch: '',
      filterDisplay: ''
    }
  }
  
  componentWillMount = () => {
    let id = this.props.match.params.id;
    this.fetchTracks(id);
  }

  componentWillReceiveProps(nextProps) {
    let nextId = nextProps.match.params.id;
    this.fetchTracks(nextId);
  }

  fetchTracks = (song) => {
    if (song) {
      tracksForSong(song).then(tracks => {
        this.setState({
          tracks: tracks
        })
      });
    }
  }
  
  sortShows = (attr, order) => {
    let sorted;
    let tracks = this.state.tracks;
    if (attr === 'date') {
      sorted = tracks.sort((a, b) => {
        var c = new Date(a.date);
        var d = new Date(b.date);
        if (order === 'asc') {
          return c-d;
        } else if (order === 'desc') {
          return d-c;
        }
      });
    }

    if (attr === 'jamcharts') {
      sorted = tracks.filter(show => {
        return isJamchart(show.id);
      })
    }

    if (attr === 'likes_count') {
      sorted = tracks.sort((a, b) => {
        return parseFloat(b.likes_count) - parseFloat(a.likes_count);
      });
    }

    this.setState({
      tracks: sorted
    })
  }

  handleChange = (filterOption) => {
    this.sortShows(filterOption.attr, filterOption.order);
    this.setState({ filterOption: filterOption });
  }

  setFilterDisplay = (title) => {
    console.log(title);
    this.setState({filterDisplay: title});
  }

  getLikesPercent = (likes) => {
    const max = Math.max.apply(Math,this.state.tracks.map(function(o){
      return o.likes_count;
    }));
    let percent = Math.ceil((likes / max) * 100);
    return percent > 0 ? percent + "%" : "5px";
  }


  renderTracks = () => {
    let tracks = this.state.tracks;
    let emitter = this.props.emitter;
    
    return tracks.map(track => {
      return (
        <li key={track.id}>
          <span className="play-cell">
            <span className="play-button-sm">
              <Ionicon 
                style={{cursor: 'pointer'}}
                icon="ios-play"
                font-size="40px"
                onClick={() => {
                  // emitter.emit('playlistUpdate', show.id, track.position - 1)
                }}
                className="track-play"
              />
            </span>
            <span className="pause-button-sm">
              <Ionicon 
                style={{cursor: 'pointer'}}
                icon="ios-pause"
                font-size="40px"
                onClick={() => {
                  // emitter.emit('pauseCurrentSong', show.id, track.position - 1)
                }}
                className="track-pause"
              />
            </span>
            <span className="track-number">{track.position}</span>
          </span>
          <span className="title-cell">{track.title}</span>
          <span className="jamcharts-cell">{isJamchart(track.id) ? "Jamcharts" : ""}</span>
          <span className="length-cell">{msToSec(track.duration)}</span>
          <span className="likes-cell">
            <Tooltip
              trigger="mouseenter"
              interactive
              inertia={false}
              arrow={true}
              animation="fade"
              arrowSize={"small"}
              duration={200}
              html={<span>{track.likes_count} {track.likes_count === 1 ? "Like" : "Likes"}</span>}
            >
              <div className="likes-bar">
                <div 
                  className="inside-bar"
                  style={{width: this.getLikesPercent(track.likes_count)}}
                >
                </div>
              </div>
            </Tooltip>
          </span>
        </li>
      );
    });
  }

  renderTrackContainer = () => {
    return (
      <ul className="playlist-section"> 
        <li className="show-container-item header-cell">
          <span className="play-cell">
            #
          </span>
          <span className="title-cell">Title</span>
          <span className="jamcharts-cell"></span>
          <span className="length-cell">
            <Ionicon
              icon="md-time"
              color="black"
            />
          </span>
          <span className="likes-cell">
            <Ionicon 
              icon="md-heart-outline"
              font-size="30px"
              color="black"
            />
          </span>
        </li>
        {this.renderTracks()} 
      </ul>
    )
  }

  setCurrentFilter = (title) => {
    this.setState({currentFilter: title});
  }

  render() {
    let tracks = this.state.tracks;
    
    // if (!tracks) {
    //   return (<div> Loading ... </div>);
    // }

    return (
      <div>
        <div className="filters">
          <Ionicon
            className="clickable"
            icon="ios-arrow-dropup-circle" 
            fontSize="40px"
            onClick={() => {
              //animate this one day
              this.refs.shows.scrollTop = 0;
            }}
          />
          {this.state.filterDisplay.length ?
            <div className="filter-display">
              Song: {this.state.filterDisplay}
            </div>
            :
            null
          }
          <div className="search-filter">
            <Filter 
              history={this.props.history}
              setTitle={this.setFilterDisplay.bind(this)}
              name={"Songs"}
              path={"/song/"}
              placeholder={"Search For Song"}
              options={songFilters}
            />
          </div>

          <div className="search-filter">
            <Select
              name={"Sort by"}
              placeholder={"Sort by"}
              value={this.state.songSearch}
              onChange={this.handleChange.bind(this)}
              options={sortByOptions}
            />
          </div>

          <div className="load-more" onClick={() => {
                  this.fetchAllShows();
                }}
              >
              Remove Filters
          </div>
        </div>
        {tracks ? 
          <div className="tracks-container" ref="tracks">
              {this.renderTrackContainer(tracks)}
          </div>
          : 
          <div>Choose a song from the list!</div>
        }
      </div>
    );
  }
}
