/* tslint:disable */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogContent } from '@angular/material/dialog';
import { MatSpinner } from '@angular/material/progress-spinner';
import { of, throwError } from 'rxjs';
import { CarrouselComponent, Drawings } from './carrousel.component';

describe('CarrouselComponent', () => {
  let component: CarrouselComponent;
  let fixture: ComponentFixture<CarrouselComponent>;
  let httpTestingController: HttpTestingController;
  const drawingMock: Drawings = { name: 'test', tag: 'tagtest', imageData: 'datatest' };
  const drawingMock2: Drawings = { name: 'test2', tag: 'tagtest2', imageData: 'datatest2' };
  const drawingMock3: Drawings = { name: 'test3', tag: 'tagtest3', imageData: 'datatest' };
  const drawingMock4: Drawings = { name: 'test4', tag: 'tagtest4', imageData: 'datatest' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CarrouselComponent, MatSpinner, MatDialogContent],
      imports: [HttpClientTestingModule],
    }).compileComponents();
    httpTestingController = TestBed.get(HttpTestingController);
  }));

  afterEach(() => {
    httpTestingController.verify();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarrouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    expect(component).toBeTruthy();
  });
  it('test', () => {
    component.getDrawings().subscribe((data: Drawings[]) => {
      //  expect(data).not.toBe(null)
    });
    httpTestingController.match({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
  });

  it('addDrawing should  add a drawing if it exists and not add if it does exists', () => {
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    component.addDrawing(drawingMock);
    component.addDrawing(drawingMock);
    component.addDrawing(drawingMock2);

    expect(component.drawingsToShow.length).toBe(2);
  });
  it('onkeyDownWindow should not  call next if rightArrow was pressed and drawingsToShow size  is < 2', () => {
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    let nextSpy = spyOn<any>(component, 'next').and.callThrough();
    component.onkeyDownWindow(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(nextSpy).not.toHaveBeenCalled();
  });
  it('onkeyDownWindow should   call next if rightArrow was pressed and drawingsToShow size  is >=2', () => {
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    let nextSpy = spyOn<any>(component, 'next').and.callThrough();
    component.drawingsToShow.push(drawingMock);
    component.drawingsToShow.push(drawingMock);

    component.onkeyDownWindow(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

    expect(nextSpy).toHaveBeenCalled();
  });

  it('onkeyDownWindow should not  call previous if leftArrow was pressed and drawingsToShow size  is < 2', () => {
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    let previousSpy = spyOn<any>(component, 'previous').and.callThrough();
    component.onkeyDownWindow(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(previousSpy).not.toHaveBeenCalled();
  });
  it('onkeyDownWindow should   call previous if leftArrow was pressed and drawingsToShow size  is >=2', () => {
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    let previousSpy = spyOn<any>(component, 'previous').and.callThrough();
    component.drawingsToShow.push(drawingMock);
    component.drawingsToShow.push(drawingMock);
    component.onkeyDownWindow(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(previousSpy).toHaveBeenCalled();
  });
  it('next should call swapDrawings if  allDrawings"s size  is <  3', () => {
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    let swipeSpy = spyOn<any>(component, 'swapDrawings').and.callThrough();
    component.next();
    expect(swipeSpy).toHaveBeenCalled();
  });
  it('next should not call swapDrawings if  allDrawings"s size  >= 3', () => {
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    let swipeSpy = spyOn<any>(component, 'swapDrawings').and.callThrough();
    component.allDrawings.push(drawingMock);
    component.allDrawings.push(drawingMock);
    component.allDrawings.push(drawingMock);
    component.next();
    expect(swipeSpy).not.toHaveBeenCalled();
  });
  it('next should add the next drawing to the array and pop the previous one', () => {
    const drawingMock3: Drawings = { name: 'test3', tag: 'tagtest3', imageData: 'datatest' };
    const drawingMock4: Drawings = { name: 'test4', tag: 'tagtest4', imageData: 'datatest' };
    component.middlePosition = 1;
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    component.allDrawings.push(drawingMock);
    component.allDrawings.push(drawingMock2);
    component.allDrawings.push(drawingMock3);
    component.allDrawings.push(drawingMock4);
    // initial state of drawingsToShow array
    component.drawingsToShow.push(drawingMock);
    component.drawingsToShow.push(drawingMock2);
    component.drawingsToShow.push(drawingMock3);
    component.next();
    //after next, drawingsToShow should contain (drawingMock,drawingMock3,drawingMock4)
    expect(component.drawingsToShow).toContain(drawingMock2);
    expect(component.drawingsToShow).toContain(drawingMock3);
    expect(component.drawingsToShow).toContain(drawingMock4);
    expect(component.drawingsToShow).not.toContain(drawingMock);
  });
  it('previous should add the previous drawing to the array and pop the next one', () => {
    component.middlePosition = 1;
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    component.allDrawings.push(drawingMock);
    component.allDrawings.push(drawingMock2);
    component.allDrawings.push(drawingMock3);
    component.allDrawings.push(drawingMock4);
    // initial state of drawingsToShow array
    component.drawingsToShow.push(drawingMock);
    component.drawingsToShow.push(drawingMock2);
    component.drawingsToShow.push(drawingMock3);
    component.previous();
    //after previous, drawingsToShow should contain (drawingMock4,drawingMock,drawingMock2)
    expect(component.drawingsToShow).toContain(drawingMock4);
    expect(component.drawingsToShow).toContain(drawingMock);
    expect(component.drawingsToShow).toContain(drawingMock2);
    expect(component.drawingsToShow).not.toContain(drawingMock3);
  });
  it('swipeDrawings should swipe the two drawings position inside the array', () => {
    component.middlePosition = 1;
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    component.allDrawings.push(drawingMock);
    component.allDrawings.push(drawingMock2);
    // initial state of drawingsToShow array
    component.drawingsToShow.push(drawingMock);
    component.drawingsToShow.push(drawingMock2);
    expect(component.drawingsToShow[1]).toEqual(drawingMock2);
    expect(component.drawingsToShow[0]).toEqual(drawingMock);
    component.swapDrawings();
    //after next, drawingsToShow should contain (drawingMock,drawingMock3,drawingMock4)
    expect(component.drawingsToShow[0]).toEqual(drawingMock2);
    expect(component.drawingsToShow[1]).toEqual(drawingMock);
  });
  it('getDrawings should set spinnerVisible to true and emptyCarrouselMessage to false ', () => {
    component.getDrawings().subscribe(() => { });
    httpTestingController.match({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    expect(component.spinnerVisible).toEqual(true);
    expect(component.emptyCarrouselMessage).toEqual(false);
  });
  it('getDrawings should return an array of drawings   ', () => {
    let drawingsMock: Drawings[] = [drawingMock, drawingMock2];
    spyOn(component, 'getDrawings').and.returnValue(of(drawingsMock));
    component.getDrawings().subscribe((drawings) => {
      expect(drawings).toEqual(drawingsMock);
    });

    httpTestingController.match({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
  });
  it('fillCaroussel should call getDrawings and  fill allDrawings  and drawingsToShow   ', () => {
    let drawingsMock: Drawings[] = [drawingMock, drawingMock2, drawingMock3, drawingMock4];
    let spy = spyOn(component, 'getDrawings').and.returnValue(of(drawingsMock));

    component.fillCarousel();
    expect(spy).toHaveBeenCalled();
    expect(component.allDrawings).toEqual(drawingsMock);
    drawingsMock.pop();
    expect(component.drawingsToShow).toEqual(drawingsMock);
    expect(component.step).toEqual(3);
    expect(component.middlePosition).toEqual(1);
    expect(component.spinnerVisible).toEqual(false);

    httpTestingController.match({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
  });
  it('deleteFromServer should should set spinnerVisible to true and emptyCarrouselMessage to false  ', () => {
    const drawingMock = { name: 'test1', tag: 'tag', imageData: 'imageData', _id: 'ok' };
    component.allDrawings.push(drawingMock);
    component.deleteFromServer(0).subscribe(() => { });
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    httpTestingController.expectOne({ method: 'DELETE', url: 'http://localhost:3000/api/drawings/ok' });
    expect(component.spinnerVisible).toEqual(true);
    expect(component.emptyCarrouselMessage).toEqual(false);
  });
  it('deleteFromServer should return the deletedElement   ', () => {
    const drawingMock = { name: 'test1', tag: 'tag', imageData: 'imageData', _id: 'ok' };
    spyOn(component, 'deleteFromServer').and.returnValue(of(drawingMock));
    component.allDrawings.push(drawingMock);
    component.deleteFromServer(0).subscribe((drawings) => {
      expect(drawings).toEqual(drawingMock);
    });
    httpTestingController.match({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
  });
  it('delete should call deleteFromServer,addDrawing and delete the drawing from the carousel   ', () => {
    const drawingsMock: any[] = [
      { name: 'test1', tag: 'tag', imageData: 'imageData', _id: 'ok' },
      { name: 'test2', tag: 'tag', imageData: 'imageData', _id: 'ok2' },
      { name: 'test3', tag: 'tag', imageData: 'imageData', _id: 'ok3' },
      { name: 'test4', tag: 'tag', imageData: 'imageData', _id: 'ok4' },
    ];
    let deleteSpy = spyOn(component, 'deleteFromServer').and.returnValue(of(drawingsMock[1]));
    let addDrawingSpy = spyOn(component, 'addDrawing').and.callThrough();
    component.middlePosition = 1;
    drawingsMock.forEach((element) => {
      component.allDrawings.push(element);
    });

    component.drawingsToShow.push(drawingsMock[0]);
    component.drawingsToShow.push(drawingsMock[1]);
    component.drawingsToShow.push(drawingsMock[2]);
    component.delete(drawingsMock[1]);

    // delete function will delete the drawing from both arrays allDrawings and drawingsToShow .
    expect(deleteSpy).toHaveBeenCalled();
    expect(addDrawingSpy).toHaveBeenCalled();
    expect(component.drawingsToShow).toContain(drawingsMock[0]);
    expect(component.drawingsToShow).toContain(drawingsMock[2]);
    expect(component.drawingsToShow).toContain(drawingsMock[3]);
    expect(component.drawingsToShow).not.toContain(drawingsMock[1]);
    expect(component.spinnerVisible).toEqual(false);
    expect(component.deleteErrorMessage).toEqual(false);
    expect(component.carouselVisible).toEqual(true);
    //only in this case, otherwise it would not be equal.
    expect(component.allDrawings).toEqual(component.drawingsToShow);
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
  });
  it('delete should after deleting  call addDrawing first drawing to drawingsToShow array if middlePosition > size    ', () => {
    const drawingsMock: any[] = [
      { name: 'test1', tag: 'tag', imageData: 'imageData', _id: 'ok' },
      { name: 'test2', tag: 'tag', imageData: 'imageData', _id: 'ok2' },
      { name: 'test3', tag: 'tag', imageData: 'imageData', _id: 'ok3' },
      { name: 'test4', tag: 'tag', imageData: 'imageData', _id: 'ok4' },
    ];
    let addDrawingSpy = spyOn(component, 'addDrawing').and.callThrough();
    spyOn(component, 'deleteFromServer').and.returnValue(of(drawingsMock[1]));

    component.middlePosition = 10;
    drawingsMock.forEach((element) => {
      component.allDrawings.push(element);
    });

    component.drawingsToShow.push(drawingsMock[0]);
    component.drawingsToShow.push(drawingsMock[1]);
    component.drawingsToShow.push(drawingsMock[2]);
    component.delete(drawingsMock[1]);

    expect(addDrawingSpy).toHaveBeenCalled();
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
  });
  it(' in case of error, delete should change  carousel attribute"s value   ', () => {
    spyOn(component, 'deleteFromServer').and.returnValue(throwError({ status: 404 }));
    component.allDrawings.push(drawingMock);
    component.drawingsToShow.push(drawingMock);
    component.delete(drawingMock);
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    expect(component.spinnerVisible).toEqual(false);
    expect(component.deleteErrorMessage).toEqual(true);
    expect(component.carouselVisible).toEqual(true);
  });
  it(' in case of error, getDrawings should change  carousel attribute"s value   ', () => {
    spyOn(component, 'getDrawings').and.returnValue(throwError({ status: 404 }));
    component.fillCarousel();
    httpTestingController.expectOne({ method: 'GET', url: 'http://localhost:3000/api/drawings/localServer' });
    expect(component.spinnerVisible).toEqual(false);
    expect(component.errorMessageVisible).toEqual(true);
  });
});
