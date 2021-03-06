import React from 'react';
import style from './style/app.css';
import { connect } from 'react-redux';
import { 
    getPlayList,
    nextMusic,
    previousMusic,
    selectMusic
} from '../actions/playlist';

import MusicItem from '../component/MusicItem';

// 导入音乐列表
import list from '../../playlist.json';

class App extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            isPlaying: true,
            isMute: false,
            currentProgress: 0,
            maxProgress: 100,
            progressBarMaskWidth: '0px',
            currentVolume: 0,
            maxVolume: 100,
            volumeBarMaskWidth: '0px',
            showList: false
        };

        // 为下面方法绑定this
        this.handleChangeProgress = this.handleChangeProgress.bind(this);
        this.handleChangeVolume = this.handleChangeVolume.bind(this);
        this.handleToggelMute = this.handleToggelMute.bind(this);
        this.handleNextMusic = this.handleNextMusic.bind(this);
        this.handlePreviousMusic = this.handlePreviousMusic.bind(this);
        this.handleTogglePlay = this.handleTogglePlay.bind(this);
        this.handleMusicReady = this.handleMusicReady.bind(this);
        this.handleSelectMusic = this.handleSelectMusic.bind(this);
        this.handleToggleShowList = this.handleToggleShowList.bind(this);
    }

    handleChangeProgress(e){

        // 通过当前音乐时间和音乐时长来计算得出音乐进度条长度
        let progressBarMaskWidth = e.target.value / this.state.maxProgress * (this.refs.progressBar.offsetWidth - 20);

        this.setState({
            currentProgress: e.target.value,
            progressBarMaskWidth: progressBarMaskWidth + "px"
        });

        this.refs.musicPlayer.currentTime = e.target.value;

    }

    handleChangeVolume(e){

        let volume = e.target.value;

        if(volume == 0){
            this.setState({
                isMute: true,
                currentVolume: 0,
                volumeBarMaskWidth: '0px'
            });
        }else{

            // 通过音量值和最大音量值计算的音量滑动条长度
            let volumeBarMaskWidth = volume / this.state.maxVolume * (this.refs.volumeBar.offsetWidth - 10);

            this.setState({
                isMute: false,
                currentVolume: volume,
                volumeBarMaskWidth: volumeBarMaskWidth + "px"
            });

            this.refs.musicPlayer.volume = e.target.value / this.state.maxVolume;
        }

    }

    handleToggelMute(){
        this.setState({
            isMute: !this.state.isMute
        });

        this.refs.musicPlayer.muted = !this.state.isMute;
    }

    handleToggleShowList(){
        this.setState({
            showList: !this.state.showList
        });
    }

    handleNextMusic(){
        this.props.dispatch(nextMusic());
        this.setState({
            isPlaying: true,
            progressBarMaskWidth: '0px',
            currentProgress: 0
        });
    }

    handleSelectMusic(count){
        this.props.dispatch(selectMusic(count));
        this.setState({
            isPlaying: true,
            progressBarMaskWidth: '0px',
            currentProgress: 0
        });
    }

    handlePreviousMusic(){
        this.props.dispatch(previousMusic());
        this.setState({
            isPlaying: true,
            progressBarMaskWidth: '0px',
            currentProgress: 0
        });
    }

    handleTogglePlay(){
        this.setState({
            isPlaying: !this.state.isPlaying
        });

        if(!this.state.isPlaying){
            this.refs.musicPlayer.play();
        }else{
            this.refs.musicPlayer.pause();
        }

    }

    handleMusicReady(e){
        this.setState({
            currentProgress: 0,
            maxProgress: e.target.duration,
            progressBarMaskWidth: '0px'
        });
    }

    // 初始化音乐列表
    componentWillMount(){
        this.props.dispatch(getPlayList(list));
    }

    componentDidMount(){

        let ctx = this;

        // 初始化音量大小
        ctx.setState({
            currentVolume: 100,
            volumeBarMaskWidth: ctx.refs.volumeBar.offsetWidth - 10 + "px"
        });

        // 设置音乐进度和时间
        setInterval(() => {

            let progressBarMaskWidth = ctx.refs.musicPlayer.currentTime / ctx.state.maxProgress * (ctx.refs.progressBar.offsetWidth - 20);

            ctx.setState({
                currentProgress: ctx.refs.musicPlayer.currentTime,
                progressBarMaskWidth: progressBarMaskWidth
            })

        }, 1000)

    }
    
    render(){

        let { playlist } = this.props;

        return (

            <div className={style.root}>
                <audio
                    onEnded={this.handleNextMusic}
                    onLoadedData={this.handleMusicReady}
                    ref="musicPlayer"
                    autoPlay
                    src={playlist.list[playlist.current] ? playlist.list[playlist.current].mp3Url : ''}
                    >
                </audio>
                <div className={style.console}>
                    <div className={style['console-cover']}>
                        <div 
                            className={style['cover-bg']}
                            style={{
                                backgroundImage: 'url(' + (playlist.list[playlist.current] ? playlist.list[playlist.current].album.picUrl : '') + ')'
                            }}
                            >
                        </div>
                        <div 
                            className={ style.cover + ' ' + (this.state.isPlaying ? 'rotate' : '')}
                            style={{
                                backgroundImage: 'url(' + (playlist.list[playlist.current] ? playlist.list[playlist.current].album.picUrl : '') + ')'
                            }}>
                        </div>
                    </div>
                    <div className={style['console-main']}>
                        <div className={style.title}>
                            {playlist.list[playlist.current] ? playlist.list[playlist.current].name : ''}
                        </div>
                        <div className={style.artist}>
                            {playlist.list[playlist.current] ? playlist.list[playlist.current].artists.map(artist=> artist.name).join(' / ') : ''}
                        </div>
                        <div className={style['progress-main']}>
                            <div className={style['progress-bar']} ref="progressBar">
                                <input 
                                    type="range" 
                                    value={this.state.currentProgress}
                                    max={this.state.maxProgress}
                                    onChange={this.handleChangeProgress}/>
                                <div style={{
                                    width: this.state.progressBarMaskWidth
                                }}></div>
                            </div>
                            <div className={style['progress-duration']}>
                                {formatTime(this.state.currentProgress) + ' / ' + formatTime((this.state.maxProgress))}
                            </div>
                        </div>
                        <div className={style['console-tools']}>
                            <div className={style.left}>
                                <span className="fa fa-step-backward" onClick={this.handlePreviousMusic}></span>
                                <span className={'fa ' + (this.state.isPlaying ? 'fa-pause' : 'fa-play')} onClick={this.handleTogglePlay}></span>
                                <span className="fa fa-step-forward" onClick={this.handleNextMusic}></span>
                            </div>
                            <div className={style.right}>
                                <span 
                                    className="fa fa-list-ul"
                                    onClick={this.handleToggleShowList}
                                    >
                                </span>
                                <span 
                                    className={'fa ' + (this.state.isMute ? 'fa-volume-off' : 'fa-volume-up')}
                                    onClick={this.handleToggelMute}>
                                </span>
                                <div className={style['volume-bar']} ref="volumeBar">
                                    <input 
                                        type="range" 
                                        value={ this.state.isMute ? 0 : this.state.currentVolume}
                                        max={this.state.maxVolume}
                                        onChange={this.handleChangeVolume}/>
                                    <div style={{
                                        width: this.state.isMute ? '0px' : this.state.volumeBarMaskWidth
                                    }}></div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['song-list'] + ' ' + (this.state.showList ? style.active : '')}>
                    {
                        playlist.list.map((item, index) => {
                            return (
                                <MusicItem 
                                    onItemClick={this.handleSelectMusic}
                                    active={playlist.current === index}
                                    key={index}
                                    count={index}
                                    title={item.name}
                                    artist={item.artists.map(artist => artist.name).join(' / ')}
                                    duration={formatTime(item.duration/1000)}/>
                            )
                        })
                    }
                </div>
            </div>

        );


    }

}

function select(state){
    return ({
        playlist: state.playlist
    })
}

// 将秒数转成 xx:xx 格式
function formatTime(time){

    let minute = parseInt(time / 60);
    let second = parseInt(time % 60);

    minute = minute > 9 ? minute : '0' + minute;
    second = second > 9 ? second : '0' + second;

    return minute + ':' + second;

}

export default connect(select)(App);