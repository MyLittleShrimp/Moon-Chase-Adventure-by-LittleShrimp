export const MOVIES = {
  intro: {src:'assets/video/intro-web.mp4', poster:'assets/video/intro-first-frame.webp', title:'序章 · 月亮去哪儿了'},
  completion: {src:'assets/video/completion-web.mp4', poster:'assets/video/completion-first-frame.webp', title:'月归天上 · 心归团圆'},
};

// Finish has one owner: a skip, ended event, or delayed play rejection cannot finish twice.
export class MoviePlayer {
  constructor({overlay, video, poster, title, status, play, skip, onActive, onPause}) {
    Object.assign(this, {overlay, video, poster, title, status, play, skip, onActive, onPause});
    this.active = false;
    this.run = 0;
    skip.onclick = () => this.finish();
    play.onclick = () => video.paused ? this.resume() : this.pause();
    video.addEventListener('ended', () => this.finish());
    video.addEventListener('playing', () => { if (!this.active) return; status.textContent = ''; play.textContent = '暂停'; onPause(false); if (!video.requestVideoFrameCallback) this.revealFrame(this.run); });
    video.addEventListener('waiting', () => { if (this.active && !video.paused) status.textContent = '动画载入中…'; });
    video.addEventListener('error', () => { if (!this.active) return; status.textContent = '动画暂时无法播放，可以跳过并继续冒险。'; play.hidden = true; });
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.finish(); }
      if (e.key !== 'Tab') return;
      const buttons = [...overlay.querySelectorAll('button:not([hidden])')];
      if (e.shiftKey && document.activeElement === buttons[0]) { e.preventDefault(); buttons.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === buttons.at(-1)) { e.preventDefault(); buttons[0].focus(); }
    });
  }
  show(name, done) {
    if (this.active) return;
    this.active = true;
    this.run++;
    this.done = done;
    this.title.textContent = MOVIES[name].title;
    this.overlay.hidden = false;
    this.status.textContent = '动画载入中…';
    this.play.hidden = false;
    this.play.textContent = '暂停';
    this.video.poster = MOVIES[name].poster;
    if (this.poster) { this.poster.src = MOVIES[name].poster; this.poster.hidden = false; }
    this.onActive(true);
    this.video.src = MOVIES[name].src;
    this.video.load();
    // Keep the tiny still visible until a decoded video frame is actually presented.
    const run = this.run;
    if (this.video.requestVideoFrameCallback) this.frameRequest = this.video.requestVideoFrameCallback(() => this.revealFrame(run));
    this.resume();
    this.skip.focus();
  }
  revealFrame(run) {
    if (!this.active || run !== this.run) return;
    if (this.poster) this.poster.hidden = true;
    this.frameRequest = null;
  }
  resume() {
    if (!this.active) return;
    const run = this.run, attempt = this.attempt = (this.attempt || 0) + 1;
    this.play.textContent = '暂停';
    this.video.play()?.catch(() => {
      if (!this.active || run !== this.run || attempt !== this.attempt || this.video.error) return;
      this.status.textContent = '点击播放继续动画，也可以跳过。';
      this.play.textContent = '播放';
      this.onPause(true);
    });
  }
  pause() {
    if (!this.active) return;
    this.attempt = (this.attempt || 0) + 1;
    this.video.pause();
    this.play.textContent = '继续播放';
    this.status.textContent = '动画已暂停';
    this.onPause(true);
  }
  finish() {
    if (!this.active) return;
    this.active = false;
    this.run++;
    if (this.frameRequest != null) this.video.cancelVideoFrameCallback?.(this.frameRequest);
    this.frameRequest = null;
    if (this.poster) this.poster.hidden = true;
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
    this.overlay.hidden = true;
    this.onPause(false);
    this.onActive(false);
    const done = this.done;
    this.done = null;
    done?.();
  }
}
