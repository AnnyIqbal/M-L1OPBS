import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs';
import { select } from 'ng2-redux';
import { MyActions } from '../store/actions';

@Component({
  selector: 'app-book-parking',
  templateUrl: './book-parking.component.html',
  styleUrls: ['./book-parking.component.css']
})
export class BookParkingComponent implements OnInit {

  bookedSlots: number[] = [-1];
  default: number[] = [-1];
  bookedSlotId: number;
  show: boolean = false;
  errorFlag: boolean = false;
  username: string;
  currentDate;

  slots  = [
    { id: 0, isBooked: false, color: 'accent' },
    { id: 1, isBooked: false, color: 'accent' },
    { id: 2, isBooked: false, color: 'accent' },
    { id: 3, isBooked: false, color: 'accent' }
  ];

  bookings: FirebaseListObservable<any> ;

  @select(['UserReducer', 'type'])
  user$: Observable<any>; // gets User State of the app

  bookedParkings: [{
    id: string,
    user: string,
    date: string,
    start: string,
    end: string,
    duration: number
  }] = [{
    id: 'set',
    user: 'set',
    date: 'set',
    start: '0',
    end: '0',
    duration: 0
  }];
ngOnInit() {}
  constructor(
    private af: AngularFire,
    private a: MyActions
  ) {

      this.currentDate = new Date().toISOString().slice(0, 10); // 2017-01-30

      this.user$.subscribe(x => {
          if ( x !== 'signedout' &&  x !== undefined) {
            this.username = x.slice(0, x.indexOf('@')); // extracts username from email
          }
      });

      this.af.database.list('/bookings')
      .subscribe( (x) => {
        // console.log('subscribe');
        let temp = [];
              for (let i = 0; i < x.length; i++) {
                // console.log('outerloop: ', x[i])
                for (let k in x[i]) {
                    // console.log('innerloop: ', k);
                    if (k === '$key') {
                      continue;
                    }
                    if (k === '$exists') {
                      continue;
                    }
                    if (typeof x[i][k] !== 'function') {
                      // console.log("pushed in temp? ", x[i][k]);
                        temp.push({
                          id: x[i][k].slotId,
                          user: x[i].$key,
                          date: x[i][k].date,
                          start: x[i][k].start,
                          end: parseInt(x[i][k].start) + parseInt(x[i][k].duration) + 'AM',
                          duration: x[i][k].duration,
                        });
                    }
                  }
              }
        this.bookedParkings = <any>temp;
        console.log('bookedParkings: ', this.bookedParkings);
    });
  }

  validateSlots(formVal) {
    if(
        (formVal.date === undefined || formVal.date === null) 
        ||
        (formVal.start === undefined || formVal.start === null)
        ||
        (formVal.duration === undefined || formVal.duration === null)
      ) {
      alert('Kindly fill the Form');
    }
    else {
      this.show = true;
      this.bookedSlots = [-1];
      if (formVal.date < this.currentDate) {
        alert('Error: Kindly select a future date!');
      }
      else {
        for (let i = 0; i < this.bookedParkings.length; i++) {
          if (formVal.date === this.bookedParkings[i].date) {
            // console.log('DATE MATCHED');
              if (
                (parseInt(formVal.start) === parseInt(this.bookedParkings[i].start)) // cant
                ||
                ((parseInt(formVal.start) > parseInt(this.bookedParkings[i].start)) && ((parseInt(formVal.start)+ parseInt(formVal.duration)) < parseInt(this.bookedParkings[i].end))) //cant
                ||
                ((parseInt(formVal.start) < parseInt(this.bookedParkings[i].start)) && ((parseInt(formVal.start)+ parseInt(formVal.duration)) > parseInt(this.bookedParkings[i].start))) //cant
              ) {
                      this.bookedSlots.push(parseInt(this.bookedParkings[i].id));
                      this.default.push(parseInt(this.bookedParkings[i].id));
                      // console.log("push", this.bookedParkings[i].id);
              }
            }
          }
          // console.log('slots booked ', this.bookedSlots);
          for(let j = 1; j < this.bookedSlots.length; j++) {
            // console.log('this.bookedSlots[j]',this.bookedSlots[j]);
            this.slots[this.bookedSlots[j]].isBooked = true;
            this.slots[this.bookedSlots[j]].color = 'warn';
          }
      }
    }
  }

  BookParkings(formVal, form) {
      for (let j = 1; j < this.bookedSlots.length; j++) {
        if (this.bookedSlotId === this.bookedSlots[j]) {
          this.errorFlag = true;
        }
      }
      if (this.errorFlag) {
        alert('Error: Slot is already booked!');
      }
      else {
        formVal.slotId = this.bookedSlotId; // inserts slotid to object
        this.slots[this.bookedSlotId].isBooked = true;
        this.af.database.list('/bookings/' + this.username) // creates a new node for each user
        .push(formVal); // pushes formVal on new node each time
        alert('Parking Slot Booked!');
        this.show = false;
        form.reset(); //form emptied
      }
    this.errorFlag = false;
  }

  slotBooked(slotId) {
    this.bookedSlotId = slotId.id;
  }

}
