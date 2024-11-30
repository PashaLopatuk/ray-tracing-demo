import {MonkeyTeapotScene} from '@/scene/monkey-teapot-scene/Scene';

export enum Scenes {
  CornellBox,
  MonkeyTeapot
}

export function getScene(scene: Scenes) {
  switch (scene) {
    case Scenes.CornellBox : {
      return MonkeyTeapotScene
    }
    case Scenes.MonkeyTeapot : {
      return MonkeyTeapotScene
    }
  }
}