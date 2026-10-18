package kr.beatparade.game;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.*;
import android.net.Uri;
import android.media.AudioManager;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import java.io.ByteArrayInputStream;
import java.util.Collections;

public final class MainActivity extends Activity {
 private WebView web;
 private AudioManager audio;
 private AudioFocusRequest focus;
 private static final String HOST="appassets.androidplatform.net";
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
  getWindow().setStatusBarColor(0xff111626);
  getWindow().setNavigationBarColor(0xff111626);
  getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
  web=new WebView(this);web.setBackgroundColor(0xff111626);setContentView(web);
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setMediaPlaybackRequiresUserGesture(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setSupportZoom(false);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return !HOST.equals(r.getUrl().getHost());}
   @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){
    Uri uri=r.getUrl();String path=uri.getPath();
    if(!"https".equals(uri.getScheme())||!HOST.equals(uri.getHost())||path==null||!path.matches("/[A-Za-z0-9._-]+"))return empty();
    String file=path.substring(1);String mime=file.endsWith(".html")?"text/html":file.endsWith(".js")?"application/javascript":file.endsWith(".css")?"text/css":"text/plain";
    try{return new WebResourceResponse(mime,"UTF-8",200,"OK",Collections.singletonMap("Cache-Control","no-cache"),getAssets().open(file));}catch(Exception e){return empty();}
   }
  });
  audio=(AudioManager)getSystemService(AUDIO_SERVICE);
  focus=new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN).setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build()).setOnAudioFocusChangeListener(change->{if(change<0)web.post(()->web.evaluateJavascript("window.nativePause&&window.nativePause()",null));}).build();
  web.loadUrl("https://"+HOST+"/index.html");
 }
 private WebResourceResponse empty(){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
 @Override protected void onPause(){web.evaluateJavascript("window.nativePause&&window.nativePause()",null);web.onPause();audio.abandonAudioFocusRequest(focus);super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();if(audio!=null)audio.requestAudioFocus(focus);}
 @Override public void onBackPressed(){web.evaluateJavascript("window.nativeBack&&window.nativeBack()",null);}
 @Override protected void onDestroy(){if(web!=null)web.destroy();super.onDestroy();}
}
