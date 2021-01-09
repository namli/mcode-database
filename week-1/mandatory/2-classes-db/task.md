# Class Database

## Submission

Below you will find a set of tasks for you to complete to consolidate and extend your learning from this week. You will find it beneficial to complete the reading tasks before attempting some of these.

To submit this homework write the correct commands for each question here:

```sql

***Task_1***

SELECT DISTINCT room_type as luxury_rooms , rate FROM rooms where rate > 100.00;


***Task_2***

SELECT * FROM reservations WHERE checkin_date BETWEEN '2020-09-01' and '2020-09-30' AND checkout_date - checkin_date > 3;

SELECT * FROM reservations
          WHERE date_trunc('month', checkin_date) = date_trunc('month', current_date)
            AND (checkout_date - checkin_date) > 3;


***Task_3***

 SELECT * FROM Customers WHERE city LIKE 'M%';

 --solution 2 (checking upper and lower )

SELECT * FROM customers WHERE Upper(city) LIKE 'M%';

--solution 3 (other methods, includes substring, regex or lef)

SELECT * FROM customers WHERE left(city,1) = 'M';


***Task_4***

 INSERT INTO room_types (room_type, def_rate) VALUES ('PENTHOUSE', 185.00);


********* Task_5 **********

INSERT INTO rooms (room_no, rate, room_type) VALUES (501, 185.00, 'PENTHOUSE'), (502, 185.00, 'PENTHOUSE');

--INSERT INTO rooms (rate) SELECT (def_rate) FROM room_types WHERE room_type='PENTHOUSE';


********** Task_6 ***********

INSERT INTO rooms (room_no, rate, room_type) VALUES (503, 143.00, 'PREMIER PLUS');


*********** Task_7 ***********

-- incl multiple times checked rooms --

SELECT room_no FROM reservations WHERE checkin_date BETWEEN '2020-08-01' and '2020-08-31';

 count
-------
    36
(1 row)

-- no multiple --

SELECT COUNT(DISTINCT room_no) FROM reservations WHERE checkin_date BETWEEN '2020-08-01' and '2020-08-31';

 count
-------
    26
(1 row)

************ Task_8 ***********

SELECT SUM(checkout_date - checkin_date) as floor_2_total_nights FROM reservations WHERE room_no BETWEEN 201 AND 299;

 floor_2_total_nights
----------------------
                   63
(1 row)

********** Task_9 **************

SELECT COUNT(total) as total,
        SUM(total) as grand_total,
        round(AVG(total)) as average
        FROM invoices WHERE total > 300;

 total | grand_total | average
-------+-------------+---------
    25 |    12928.00 |     517


********* Task_10 *************

-- add floor field to rooms table --

ALTER TABLE rooms
ADD floor integer;

-- set values depending on which floor --

UPDATE rooms
SET floor = 1
WHERE room_no BETWEEN 100 AND 199;

UPDATE rooms
SET floor = 2
WHERE room_no BETWEEN 200 AND 299;

UPDATE rooms
SET floor = 3
WHERE room_no BETWEEN 300 AND 399;

UPDATE rooms
SET floor = 4
WHERE room_no BETWEEN 400 AND 499;

UPDATE rooms
SET floor = 5
WHERE room_no BETWEEN 500 AND 599;

-- add nigths field to reservations --

ALTER TABLE reservations
ADD nigths integer;

-- calculate and add nights value--

UPDATE reservations
SET nigths = (checkout_date - checkin_date);

-- list floor from rooms table, and each floor's total(SUM) of nights from reservations table, by using
-- inner join and group/order by floor.

SELECT rooms.floor, SUM(reservations.nigths) as total_nigths
FROM rooms
INNER JOIN reservations ON
rooms.room_no=reservations.room_no
GROUP BY rooms.floor
ORDER BY rooms.floor;

--result (no bookings for floor 5 as we newly inserted those rooms)--

 floor | total_nigths
-------+--------------
     1 |           54
     2 |           63
     3 |           46
     4 |           40
(4 rows)


```

When you have finished all of the questions - open a pull request with your answers to the `Databases-Homework` repository.

## Homework

If you haven't completed all the exercises from this lesson then do that first.

### Tasks

1.  Which rooms have a rate of more than 100.00?
2.  List the reservations that have a checkin date this month and are for more than three nights.
3.  List all customers from cities that begin with the letter 'M'.

Insert some new data into the room_types and rooms tables, querying after each stage to check the data, as follows:

4.  Make a new room type of PENTHOUSE with a default rate of £185.00
5.  Add new rooms, 501 and 502 as room type PENTHOUSE and set the room rate of each to the default value (as in the new room type).
6.  Add a new room 503 as a PREMIER PLUS type similar to the other PREMIER PLUS rooms in the hotel but with a room rate of 143.00 to reflect its improved views over the city.

Using what you can learn about aggregate functions in the w3schools SQL classes (or other providers), try:

7.  The hotel manager wishes to know how many rooms were occupied any time during the previous month - find that information.
8.  Get the total number of nights that customers stayed in rooms on the second floor (rooms 201 - 299).
9.  How many invoices are for more than £300.00 and what is their grand total and average amount?
10. Bonus Question: list the number of nights stay for each floor of the hotel (floor no is the hundreds part of room number, e.g. room **3**12 is on floor **3**)
