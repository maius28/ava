// 高德地图 JavaScript API v2 TypeScript 类型定义
export interface AMapLngLat {
  lng: number
  lat: number
  getLng(): number
  getLat(): number
}

export interface AMapPixel {
  x: number
  y: number
  getX(): number
  getY(): number
}

export interface AMapSize {
  width: number
  height: number
  getWidth(): number
  getHeight(): number
}

export interface AMapBounds {
  northeast: AMapLngLat
  southwest: AMapLngLat
  getNorthEast(): AMapLngLat
  getSouthWest(): AMapLngLat
  contains(point: AMapLngLat): boolean
}

export interface AMapClickEvent {
  lnglat: AMapLngLat
  pixel: AMapPixel
  target: AMapMap
}

export interface AMapGeocodeResult {
  info: string
  regeocode?: {
    formattedAddress: string
    addressComponent?: {
      country: string
      province: string
      city: string
      district: string
      township: string
      street: string
      streetNumber: string
      adcode: string
      citycode: string
    }
  }
}

export interface AMapMapOptions {
  center?: [number, number] | AMapLngLat
  zoom?: number
  rotation?: number
  pitch?: number
  viewMode?: '2D' | '3D'
  features?: string[]
  layers?: any[]
  zooms?: [number, number]
  lang?: 'zh_cn' | 'en' | 'zh_en'
  defaultCursor?: string
  animateEnable?: boolean
  isHotspot?: boolean
  rotateEnable?: boolean
  resizeEnable?: boolean
  showIndoorMap?: boolean
  indoorMap?: any
  expandZoomRange?: boolean
  dragEnable?: boolean
  zoomEnable?: boolean
  doubleClickZoom?: boolean
  keyboardEnable?: boolean
  jogEnable?: boolean
  scrollWheel?: boolean
  touchZoom?: boolean
  touchZoomCenter?: number
  mapStyle?: string
  wallColor?: string
  roofColor?: string
  showBuildingBlock?: boolean
  showLabel?: boolean
  labelzIndex?: number
}

export interface AMapMarkerOptions {
  position?: [number, number] | AMapLngLat
  icon?: string | AMapIcon
  content?: string | HTMLElement
  title?: string
  visible?: boolean
  zIndex?: number
  offset?: AMapPixel
  anchor?: string
  angle?: number
  clickable?: boolean
  draggable?: boolean
  bubble?: boolean
  zooms?: [number, number]
  cursor?: string
  topWhenClick?: boolean
  label?: any
}

export interface AMapInfoWindowOptions {
  isCustom?: boolean
  autoMove?: boolean
  closeWhenClickMap?: boolean
  content?: string | HTMLElement
  size?: AMapSize
  anchor?: string
  offset?: AMapPixel
  position?: [number, number] | AMapLngLat
}

export interface AMapIconOptions {
  size?: AMapSize
  imageOffset?: AMapPixel
  image?: string
  imageSize?: AMapSize
}

export interface AMapMap {
  // 基础方法
  setZoom(zoom: number): void
  getZoom(): number
  setCenter(center: [number, number] | AMapLngLat): void
  getCenter(): AMapLngLat
  setZoomAndCenter(zoom: number, center: [number, number] | AMapLngLat): void
  setBounds(bounds: AMapBounds): void
  getBounds(): AMapBounds
  setLimitBounds(bounds: AMapBounds): void
  clearLimitBounds(): void

  // 地图样式
  setMapStyle(style: string): void
  getMapStyle(): string
  setFeatures(features: string[]): void
  getFeatures(): string[]

  // 覆盖物管理
  add(overlay: AMapMarker | AMapMarker[]): void
  remove(overlay: AMapMarker | AMapMarker[]): void
  getAllOverlays(type?: string): any[]
  clearMap(): void

  // 控件管理
  addControl(control: AMapControl): void
  removeControl(control: AMapControl): void

  // 事件
  on(event: string, callback: (e: AMapClickEvent) => void): void
  off(event: string, callback: (e: AMapClickEvent) => void): void

  // 工具方法
  getContainer(): HTMLElement
  getSize(): AMapSize
  pixelToLngLat(pixel: AMapPixel): AMapLngLat
  lngLatToPixel(lnglat: AMapLngLat): AMapPixel
  destroy(): void
}

export interface AMapMarker {
  setPosition(position: [number, number] | AMapLngLat): void
  getPosition(): AMapLngLat
  setTitle(title: string): void
  getTitle(): string
  setIcon(icon: string | AMapIcon): void
  getIcon(): string | AMapIcon
  setContent(content: string | HTMLElement): void
  getContent(): string | HTMLElement
  setLabel(label: any): void
  getLabel(): any
  on(event: string, callback: () => void): void
  off(event: string, callback: () => void): void
  show(): void
  hide(): void
}

export interface AMapInfoWindow {
  open(map: AMapMap, position?: [number, number] | AMapLngLat): void
  close(): void
  setContent(content: string | HTMLElement): void
  getContent(): string | HTMLElement
  setPosition(position: [number, number] | AMapLngLat): void
  getPosition(): AMapLngLat
}

export interface AMapIcon {
  setImage(url: string): void
  getImage(): string
  setSize(size: AMapSize): void
  getSize(): AMapSize
  setImageOffset(offset: AMapPixel): void
  getImageOffset(): AMapPixel
  setImageSize(size: AMapSize): void
  getImageSize(): AMapSize
}

export interface AMapControl {
  show(): void
  hide(): void
  addTo(map: AMapMap): void
  remove(): void
}

export interface AMapToolBar extends AMapControl {
  getOffset(): AMapPixel
  setOffset(offset: AMapPixel): void
}

export interface AMapScale extends AMapControl {
  getOffset(): AMapPixel
  setOffset(offset: AMapPixel): void
}

export interface AMapHawkEye extends AMapControl {
  open(): void
  close(): void
}

export interface AMapGeocoder {
  getAddress(
    position: [number, number] | AMapLngLat,
    callback: (status: string, result: AMapGeocodeResult) => void
  ): void
  getLocation(
    address: string,
    callback: (status: string, result: any) => void
  ): void
}

// 全局 AMap 对象类型
export interface AMapStatic {
  Map: new (container: string | HTMLElement, options?: AMapMapOptions) => AMapMap
  Marker: new (options?: AMapMarkerOptions) => AMapMarker
  InfoWindow: new (options?: AMapInfoWindowOptions) => AMapInfoWindow
  Icon: new (options?: AMapIconOptions) => AMapIcon
  Size: new (width: number, height: number) => AMapSize
  Pixel: new (x: number, y: number) => AMapPixel
  LngLat: new (lng: number, lat: number) => AMapLngLat
  Bounds: new (southwest: AMapLngLat, northeast: AMapLngLat) => AMapBounds
  ToolBar: new (options?: { position?: string }) => AMapToolBar
  Scale: new (options?: { position?: string }) => AMapScale
  HawkEye: new (options?: { isOpen?: boolean; visible?: boolean }) => AMapHawkEye
  Geocoder: new (options?: any) => AMapGeocoder
}

declare global {
  interface Window {
    AMap: AMapStatic
    _AMapSecurityConfig?: {
      securityJsCode: string
    }
  }
}
