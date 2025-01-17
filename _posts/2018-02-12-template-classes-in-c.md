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
    - C++
    - code
    - template
---

C++ is one of the most powerful programming language in the world. You can practically do everything with it. Furthermore you keep full control of the memory and you can literally address each single bit of it. Of course with great power comes great responsibilities and many programmers often have problems to deal with it (that is why crap languages like java are very popular…). Anyway, today i want to show some example of advanced usage of c++ templates.

Templates are helpful in case you want to write functions that accept generic types as arguments. But lets make a step back. C++ is a type safe language, meaning that you need to declare the type of the variable before you can actually use it. Not all the languages are type safe. For example in python you can type “a=10” without declaring if “a” is a int or a double.  
Type-safety is in general a good thing because the compiler can also do a bunch of checks to help avoid bug in your applications. However sometimes we are writting functions that can work with multiple types such as int, float, double. For example, a function that return the max between two numbers. The implementation of that function is the same regardless of the numeric type input. So how can we write one function that works for different types such as “int”,”float”, “double”…? Templates!

In the easiest usage you can just easily write this:

<div class="wp-block-syntaxhighlighter-code ">```

//return the max between two numbers
template <class myNum>
myNum GetMax (myNum a, myNum b) {
 return (a>b?a:b);
}
```

</div>then in order to use it you can just write:

<div class="wp-block-syntaxhighlighter-code ">```

float x,y;
GetMax <float> (x,y);
```

</div>Template can also be more complex. For example in case we want to have a matrix class that accept the size of the matrix as parameters and the numeric type of the values you could write something like:

<div class="wp-block-syntaxhighlighter-code ">```

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

</div>Now when you want to use the class you can easily do that by typing:

<div class="wp-block-syntaxhighlighter-code ">```

//usage of the class
templated_matrix<5,10,float> mymatrix;
```

</div>And this is it.. Now, few remarks:

1\. Every time that you actually change the size of the type of that matrix Class, the compiler Generate a NEW function with the matching footprint. So templated\_matrix&lt;5,10,float&gt;; templated\_matrix&lt;6,10,float&gt;; templated\_matrix&lt;5,10,int&gt;; refer to three completely different functions (that the compiler created for you during compilation).

2\. When you use template you cannot separate header files (.hpp) from implementation files (.cpp) because the compiler needs to have the code full visible to be able to compile it. So the sub-optimal approach is to use .tpp files. For example the matrix before can be divided in two. The header file would look something like this and it will include the .tpp file at the end:

<div class="wp-block-syntaxhighlighter-code ">```

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

</div>and the .tpp file looks just like the implementation file:

<div class="wp-block-syntaxhighlighter-code ">```

//advanced template example
//templated_matrix.tpp 

 //implementation of the constructor 
template<unsigned int ROW, unsigned int COL, class myType > 
templated_matrix<ROW, COL, myType>:templated_matrix(){ 
//implementation... you can access ROW and COL and T values.. 
}

```

</div>And that is it! Don’t be afraid to use them!