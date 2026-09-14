import numpy as np
import pywt
import cv2

def w2d(img, mode='haar', level=1):
    imArray = img
    # تحويل الصورة إلى خريطة رمادية بأعداد عشريّة (Float)
    imArray = cv2.cvtColor(imArray, cv2.COLOR_RGB2GRAY)
    imArray = np.float32(imArray)
    imArray /= 255.0
    
    # حساب المكونات العالية والمنخفضة التردد (Coefficients)
    coeffs = pywt.wavedec2(imArray, mode, level=level)
    
    # معالجة المعاملات لتركيز التفاصيل (Edges & Textures)
    coeffs_H = list(coeffs)
    coeffs_H[0] *= 0

    # إعادة تجميع الصورة
    imArray_H = pywt.waverec2(coeffs_H, mode)
    imArray_H *= 255
    imArray_H = np.uint8(imArray_H)
    
    return imArray_H