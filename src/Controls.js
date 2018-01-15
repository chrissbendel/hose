import {emitter} from './Emitter';

class Controls {
  constructor () {
    this.show = null;
    this.track = null;
    this.position = null;
    this.playing = false;

    emitter.addListener('songUpdate', (show, track, position, playing) => {
      this.show = show;
      this.track = track;
      this.position = position;
      this.playing = playing;
    });
  }

  pause = () => {
    this.playing = false;
    emitter.emit('pause');
  }

  play = () => {
    this.playing = true;
    emitter.emit('play');
  }

  updateShowAndPosition = (e, s, p = 1) => {
    emitter.emit('playlistUpdate', s, p - 1);
  }
}

export default new Controls();