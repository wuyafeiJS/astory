(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return factory(global, global.document);
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(global, global.document);
  } else {
    global.ASR = factory(global, global.document);
  }
})(typeof window !== 'undefined' ? window : this, function (window) {
  'use strict';

  function ASR(options) {
    // 获取语音识别对象（webkitSpeechRecognition）
    var recognition = new window.webkitSpeechRecognition();
    this.recognition = recognition;
    this.options = options;
    this.audioUrl = '';
    // 设置语音识别参数
    recognition.lang = 'zh-CN';

    recognition.continuous = true;
    recognition.interimResults = true;

    // 语音识别结果回调
    var _transcript = '';
    recognition.onresult = function (event) {
      var last = event.results.length - 1;
      _transcript = event.results[last][0].transcript;
    };

    // 语音识别结束回调
    recognition.onend = function () {
      options.translateCB(_transcript);
      console.log('Speech recognition has ended.');
    };
    var _mediaRecorder = {};
    this.getMediaRecorder = function () {
      return _mediaRecorder;
    };

    function handleStream(stream) {
      // 创建MediaRecorder对象
      _mediaRecorder = new MediaRecorder(stream);

      var audioChunks = [];

      // 数据可用回调
      _mediaRecorder.ondataavailable = function (event) {
        audioChunks.push(event.data);
      };

      // 录音结束回调
      _mediaRecorder.onstop = function () {
        var blob = new Blob(audioChunks, { type: 'audio/mp3' });
        var audioUrl = URL.createObjectURL(blob);
        // 提供给用户下载或处理音频文件\
        options.setUrl && options.setUrl(audioUrl);
        // 提供给用户下载或处理音频文件
        //   var a = document.createElement('a');
        //   a.href = audioUrl;
        //   a.download = 'recording.webm';
        //   a.click();
        // 清理资源
        //   URL.revokeObjectURL(audioUrl);
      };

      // 开始录音
      _mediaRecorder.start();

      // 开始语音识别
      recognition.start();
    }
    this.start = function () {
      // 获取用户媒体设备（麦克风）
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      if (!navigator.getUserMedia && navigator.mediaDevices) {
        return navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(function (stream) {
            handleStream(stream);
            // 当不再需要访问麦克风时，记得关闭流
            // stream.getTracks().forEach(track => track.stop());
          })
          .catch(function (error) {
            console.error('Error accessing microphone:', error);
          });
      } else if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { audio: true },
          function (stream) {
            handleStream(stream);
          },
          function (error) {
            console.error('Error accessing microphone:', error);
          },
        );
      } else {
        console.error('getUserMedia is not supported in this browser.');
      }
      return _mediaRecorder;
    };
  }
  ASR.prototype.startRecord = function () {
    this.start();
  };
  ASR.prototype.stopRecord = function () {
    this.recognition.stop();
    this.getMediaRecorder().stop(); // 同时停止录音
  };
  ASR.prototype.playVoice = function (url) {
    if (!this.options.audioDom) {
      var audioPlayer = document.createElement('audio');
      // 将音频源赋值给audio元素
      audioPlayer.style.width = '1px';
      audioPlayer.style.height = '1px';
      audioPlayer.style.visibility = 'hidden';
      // 可选：添加controls属性使音频元素显示控制条
      audioPlayer.controls = true;

      // 将audio元素插入DOM树中
      document.body.appendChild(audioPlayer);
      this.options.audioDom = audioPlayer;
    }
    this.options.audioDom.src = url;
    console.log('audio url:', this.options.audioDom.src);
    this.options.audioDom.load();
    this.options.audioDom.play();
  };

  ASR.prototype.stopVoice = function () {
    this.options.audioDom.pause();
  };

  return ASR;
});
