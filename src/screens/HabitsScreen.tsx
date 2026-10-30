import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HabitsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: 40 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>Logo de AtomicFox</Text>
          <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>¡Hola, Usuario!</Text>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>4 hábitos programados para hoy</Text>
        </View>
        <TouchableOpacity style={{ backgroundColor: '#ff6600', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4 }}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Hábitos */}
      <ScrollView style={{ paddingHorizontal: 24, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* Tarjeta de Hábito 1: Completado */}
        <View style={{ backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(255, 102, 0, 0.2)', padding: 8, borderRadius: 12, marginRight: 12 }}>
                <Ionicons name="sunny" size={20} color="#ff6600" />
              </View>
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Meditación matutina</Text>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>10 mins • Diario (6:30 AM)</Text>
              </View>
            </View>
            <View style={{ borderWidth: 1, borderColor: '#c084fc', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: '#c084fc', fontSize: 12, fontWeight: 'bold' }}>100%</Text>
            </View>
          </View>
          {/* Barra de progreso */}
          <View style={{ width: '100%', backgroundColor: '#334155', height: 8, borderRadius: 999, marginVertical: 8 }}>
            <View style={{ backgroundColor: '#ff6600', height: 8, borderRadius: 999, width: '100%' }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>7/7 días</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#c084fc', fontSize: 12, fontWeight: '600', marginRight: 4 }}>Completado</Text>
              <Ionicons name="checkmark-circle" size={14} color="#c084fc" />
            </View>
          </View>
        </View>

        {/* Tarjeta de Hábito 2: En proceso */}
        <View style={{ backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(255, 102, 0, 0.2)', padding: 8, borderRadius: 12, marginRight: 12 }}>
                <Ionicons name="book" size={20} color="#ff6600" />
              </View>
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Lectura</Text>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>30 mins • Diario (8:00 PM)</Text>
              </View>
            </View>
            <View style={{ borderWidth: 1, borderColor: '#c084fc', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: '#c084fc', fontSize: 12, fontWeight: 'bold' }}>71%</Text>
            </View>
          </View>
          {/* Barra de progreso */}
          <View style={{ width: '100%', backgroundColor: '#334155', height: 8, borderRadius: 999, marginVertical: 8 }}>
            <View style={{ backgroundColor: '#ff6600', height: 8, borderRadius: 999, width: '71%' }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>5/7 días</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>Restante hoy: 30 min</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}