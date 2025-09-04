import { Injectable } from '@angular/core';
import { IAnimationService } from './design-system.interfaces';

// Animation Configuration Interface - SRP: Define animation parameters
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// Default Animation Configs
const DefaultAnimationConfig: AnimationConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design easing
  delay: 0,
  fillMode: 'forwards',
};

@Injectable({
  providedIn: 'root'
})
export class AnimationService implements IAnimationService {
  
  async fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
    return this.animate(element, [
      { opacity: '0' },
      { opacity: '1' }
    ], {
      ...DefaultAnimationConfig,
      duration
    });
  }
  
  async fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
    return this.animate(element, [
      { opacity: '1' },
      { opacity: '0' }
    ], {
      ...DefaultAnimationConfig,
      duration
    });
  }
  
  async slideIn(element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'right'): Promise<void> {
    const transforms = this.getSlideTransforms(direction);
    return this.animate(element, [
      { 
        transform: transforms.from,
        opacity: '0'
      },
      { 
        transform: transforms.to,
        opacity: '1'
      }
    ], DefaultAnimationConfig);
  }
  
  async slideOut(element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'left'): Promise<void> {
    const transforms = this.getSlideTransforms(direction, true);
    return this.animate(element, [
      { 
        transform: transforms.from,
        opacity: '1'
      },
      { 
        transform: transforms.to,
        opacity: '0'
      }
    ], DefaultAnimationConfig);
  }
  
  async bounce(element: HTMLElement): Promise<void> {
    return this.animate(element, [
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-5px)' },
      { transform: 'translateY(0px)' }
    ], {
      ...DefaultAnimationConfig,
      duration: 600,
      easing: 'ease-out'
    });
  }
  
  async pulse(element: HTMLElement): Promise<void> {
    return this.animate(element, [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ], {
      ...DefaultAnimationConfig,
      duration: 500,
      easing: 'ease-in-out'
    });
  }
  
  // Advanced animations
  async zoomIn(element: HTMLElement, duration: number = 300): Promise<void> {
    return this.animate(element, [
      { 
        transform: 'scale(0.5)',
        opacity: '0'
      },
      { 
        transform: 'scale(1)',
        opacity: '1'
      }
    ], {
      ...DefaultAnimationConfig,
      duration
    });
  }
  
  async zoomOut(element: HTMLElement, duration: number = 300): Promise<void> {
    return this.animate(element, [
      { 
        transform: 'scale(1)',
        opacity: '1'
      },
      { 
        transform: 'scale(0.5)',
        opacity: '0'
      }
    ], {
      ...DefaultAnimationConfig,
      duration
    });
  }
  
  async rotateIn(element: HTMLElement, degrees: number = 360): Promise<void> {
    return this.animate(element, [
      { 
        transform: `rotate(${degrees}deg) scale(0.8)`,
        opacity: '0'
      },
      { 
        transform: 'rotate(0deg) scale(1)',
        opacity: '1'
      }
    ], {
      ...DefaultAnimationConfig,
      duration: 500
    });
  }
  
  async shake(element: HTMLElement): Promise<void> {
    return this.animate(element, [
      { transform: 'translateX(0px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(0px)' }
    ], {
      ...DefaultAnimationConfig,
      duration: 400,
      easing: 'ease-in-out'
    });
  }
  
  // Utility method for custom animations
  async customAnimation(
    element: HTMLElement,
    keyframes: Keyframe[],
    config: Partial<AnimationConfig> = {}
  ): Promise<void> {
    const finalConfig = { ...DefaultAnimationConfig, ...config };
    return this.animate(element, keyframes, finalConfig);
  }
  
  // Stagger animations for multiple elements
  async staggerAnimation(
    elements: HTMLElement[],
    animationType: 'fadeIn' | 'slideIn' | 'zoomIn',
    staggerDelay: number = 100
  ): Promise<void> {
    const promises = elements.map((element, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          await this[animationType](element);
          resolve();
        }, index * staggerDelay);
      });
    });
    
    await Promise.all(promises);
  }
  
  private async animate(
    element: HTMLElement,
    keyframes: Keyframe[],
    config: AnimationConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const animation = element.animate(keyframes, {
          duration: config.duration,
          easing: config.easing,
          delay: config.delay,
          fill: config.fillMode
        });
        
        animation.onfinish = () => resolve();
        animation.oncancel = () => reject(new Error('Animation cancelled'));
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private getSlideTransforms(direction: 'left' | 'right' | 'up' | 'down', reverse: boolean = false) {
    const transforms = {
      left: {
        from: reverse ? 'translateX(0px)' : 'translateX(-100%)',
        to: reverse ? 'translateX(-100%)' : 'translateX(0px)'
      },
      right: {
        from: reverse ? 'translateX(0px)' : 'translateX(100%)',
        to: reverse ? 'translateX(100%)' : 'translateX(0px)'
      },
      up: {
        from: reverse ? 'translateY(0px)' : 'translateY(-100%)',
        to: reverse ? 'translateY(-100%)' : 'translateY(0px)'
      },
      down: {
        from: reverse ? 'translateY(0px)' : 'translateY(100%)',
        to: reverse ? 'translateY(100%)' : 'translateY(0px)'
      }
    };
    
    return transforms[direction];
  }
}
