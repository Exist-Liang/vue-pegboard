

import PomodoroWidget from './PomodoroWidget.vue'
import TestWidget from './TestWidget.vue'
import LoginWidget from './LoginWidget.vue'
import WeatherWidget from './WeatherWidget/WeatherWidgetContainer.vue'
import FunFactWidget from './FunFactWidget.vue'
import WidgetSelectorWidget from './WidgetSelectorWidget.vue'
import ImportExportWidget from './ImportExportWidget.vue'
import TextEditorWidget from './TextEditorWidget/TextEditorWidget.vue'
import IndieTextWidget from './TextEditorWidget/IndieTextWidget.vue'


export const widgetRegistry = {
  PomodoroWidget,
  TestWidget,
  LoginWidget,
  WeatherWidget,
  FunFactWidget,
  WidgetSelectorWidget,
  TextEditorWidget,
  IndieTextWidget,
  ImportExportWidget,
  
}

export const categoryOrder = ['function', 'system', 'debug']

export const widgetMetadata = {
    PomodoroWidget: {
      name: 'Pomodoro',
      icon: '🍅',
      sizeOptions: ['S'],
      category: 'function',
    },
    TextEditorWidget: {
      name: 'Text Editor',
      icon: '📝',
      sizeOptions: ['L'],  
      category: 'function',
    },
    TestWidget: {
      name: 'TestWidget',
      icon: '🧪',
      sizeOptions: ['S', 'W', 'T', 'L'],
      category: 'debug' 
    },
    ImportExportWidget: {
      name: 'Data Manager',
      icon: '📥',
      sizeOptions: ['S'],
      category: 'system'
    },
    LoginWidget: {
      name: 'Login',
      icon: '🔐',
      sizeOptions: ['W'],  
      category: 'system',
    },
    WeatherWidget: {
      name: 'Weather',
      icon: '☀️',
      sizeOptions: ['T'],
      category: 'function',
    },
    FunFactWidget: {
      name: 'Fun Facts',
      icon: '🎲',  
      sizeOptions: ['L'],
      category: 'function',
    },
    WidgetSelectorWidget: {
      name: 'Widget Picker',
      icon: '🧩',
      sizeOptions: ['L'],
      category: 'system',
    },
    IndieTextWidget: {
      name: 'Indie Text',
      icon: '📌',
      sizeOptions: ['W', 'L'],
      category: 'function',
      hidden: true, 
    },
    
  }