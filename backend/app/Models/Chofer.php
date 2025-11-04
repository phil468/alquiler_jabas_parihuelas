<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chofer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'choferes';

    protected $fillable = [
        'nombre',
        'dni',
        'licencia',
        'telefono',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // Relación con registros
    public function registros()
    {
        return $this->hasMany(Registro::class);
    }

    // Scope para choferes activos
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
