---
id: 276
title: 'Template Classes in C++'
date: '2018-02-12T12:21:34+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=276'
permalink: /2018/02/12/template-classes-in-c/
categories:
    - Technical
tags:
    - c++
    - code
    - technology
---

C++ is arguably the most powerful among programming languages, offering unparalleled control and the ability to manipulate memory at the bit level.  
This power, however, demands responsibility, a challenge many developers find daunting (hence the unfortunate popularity of languages like Java). 
Today, I'll delve into the advanced realm of C++ templates.

Templates provide a mechanism for writing functions that accept generic types.  
C++ is statically typed, requiring explicit type declarations for variables. 
This type safety is generally a good thing, enabling the compiler to catch potential bugs.  
However, it can present a hurdle when creating functions that operate on multiple types, like `int`, `float`, and `double`.  
Consider a function to determine the maximum of two numbers; the logic remains consistent regardless of the input type.  
How then can we write a single function adaptable to various numeric types?  The answer: templates!

A basic template implementation looks like this:

```c++

//return the max between two numbers
template <class myNum>
myNum GetMax (myNum a, myNum b) {
 return (a>b?a:b);
}

```

then in order to use it you can just write:

```c++

float x,y;
GetMax <float> (x,y);

```

Template can also be more complex. For example in case we want to have a matrix class that accept the size of the matrix as parameters and the numeric type of the values you could write something like:


```c++
//advanced template example

//definition of the class
template<unsigned int ROW, unsigned int COL, class myType >
class templated_matrix{
private:
 myType data [ROW][COL];  //Declare a matrix of type myType with ROWxCOL in size
public:
 templated_matrix();
}

//implementation of the constructor
template<unsigned int ROW, unsigned int COL, class myType > 
templated_matrix<ROW, COL, myType>:templated_matrix(){
         //implementation... you can access ROW and COL and T values.. 
}

```

Now when you want to use the class you can easily do that by typing:

```c++
//usage of the class
templated_matrix<5,10,float> mymatrix;
```

And this is it... Now, few remarks:

1. Every time that you actually change the size of the type of that matrix Class, the compiler Generate a NEW function with the matching footprint. 
So `templated_matrix<5,10,float>;`, `templated_matrix<6,10,float>;` and `templated_matrix<5,10,int>;` refer to three completely different functions (that the compiler created for you during compilation).

2. When you use template you cannot separate header files (.hpp) from implementation files (.cpp) because the compiler needs to have the code full visible to be able to compile it. So the sub-optimal approach is to use .tpp files. For example the matrix before can be divided in two. The header file would look something like this and it will include the .tpp file at the end:

```c++

//advanced template example
//templated_matrix.hpp

//definition of the class
template<unsigned int ROW, unsigned int COL, class myType >
class templated_matrix{
private:
 myType data [ROW][COL];  //Declare a matrix of type T with ROWxCOL in size
public:
 templated_matrix();
}

#include templated_matrix.tpp
```

and the .tpp file looks just like the implementation file:

```c++

//advanced template example
//templated_matrix.tpp 

 //implementation of the constructor 
template<unsigned int ROW, unsigned int COL, class myType > 
templated_matrix<ROW, COL, myType>:templated_matrix(){ 
//implementation... you can access ROW and COL and T values.. 
}

```

And that is it! Don’t be afraid to use them!

