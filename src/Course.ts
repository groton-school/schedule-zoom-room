export default class Course {
  public readonly id: string;
  public readonly title: string;
  public readonly beginDate: string;
  public readonly endDate: string;
  public readonly bulletinBoardUrl: string;
  public readonly room: string;
  public readonly calendarId: string;
  public readonly zoomRoomUrl: string;

  public constructor([
    groupId,
    normalizedTitle,
    beginDate,
    endDate,
    bulletinBoardUrl,
    normalizedRoom,
    calendarId,
    zoomRoomUrl
  ]: string[]) {
    this.id = groupId;
    this.title = normalizedTitle;
    this.beginDate = new Date(beginDate).toISOString();
    this.endDate = new Date(endDate).toISOString();
    this.bulletinBoardUrl = bulletinBoardUrl;
    this.room = normalizedRoom;
    this.calendarId = calendarId;
    this.zoomRoomUrl = zoomRoomUrl;
  }
}
