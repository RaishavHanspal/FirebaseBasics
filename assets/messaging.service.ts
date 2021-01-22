import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { mergeMapTo } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class MessagingService {

  currentMessage = new BehaviorSubject(null);
  _Object: {} ={};
  constructor(
    private angularFireDB: AngularFireDatabase,
    private angularFireAuth: AngularFireAuth,
    private angularFireMessaging: AngularFireMessaging) {
    this.angularFireMessaging.messages.subscribe(
      (messaging: AngularFireMessaging) => {
        messaging.onMessage = messaging.onMessage.bind(messaging);
        messaging.onTokenRefresh = messaging.onTokenRefresh.bind(messaging);
      }
    )
  }
  updateDatabase(userId, dataObject) {
    this.angularFireAuth.authState.pipe(take(1)).subscribe(
      () => {
        for(let temp of Object.entries(dataObject))
        this._Object[temp[0]] = temp[1];
        console.log(this._Object)
        var FinalObj = JSON.parse(localStorage.getItem("Obj_State")) || {}
        FinalObj[userId] = {...FinalObj[userId],...this._Object}
        localStorage.setItem("Obj_State",JSON.stringify(FinalObj))
        this.angularFireDB.object('Users/').set(FinalObj)
      })
  }

  requestPermission(userId) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        console.log(token);
        this.updateDatabase(userId,{tokenID: token});
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }
}